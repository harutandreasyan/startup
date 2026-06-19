import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { StorageService } from '../storage/storage.service';
import { GENERATION_QUEUE, type GenerationJobData } from '../../config/queue';
import { GenerationsGateway } from './generations.gateway';

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 240; // ~10 min ceiling

@Processor(GENERATION_QUEUE)
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiProviders: AiProvidersService,
    private storage: StorageService,
    private gateway: GenerationsGateway,
  ) {
    super();
  }

  async process(job: Job<GenerationJobData>): Promise<void> {
    const { generationId } = job.data;
    const startedAt = Date.now();

    const generation = await this.prisma.generation.findUnique({ where: { id: generationId } });
    if (!generation) {
      this.logger.warn(`Generation ${generationId} not found, skipping`);
      return;
    }

    const model = await this.prisma.aiModel.findUnique({ where: { slug: generation.model } });
    if (!model) {
      await this.fail(generation.id, generation.userId, generation.creditsCost, 'Model not found');
      return;
    }

    try {
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: 'PROCESSING' },
      });
      this.gateway.emitProgress(generation.userId, { generationId, status: 'PROCESSING' });

      // Build provider input from the generation row
      const input = this.buildInput(generation);
      const started = await this.aiProviders.run(model.provider, {
        providerModelId: model.providerModelId,
        input,
      });

      await this.prisma.generation.update({
        where: { id: generationId },
        data: { providerJobId: started.providerJobId },
      });

      // Poll until done
      let result = started;
      for (let i = 0; i < MAX_POLLS && (result.status === 'starting' || result.status === 'processing'); i++) {
        await this.sleep(POLL_INTERVAL_MS);
        result = await this.aiProviders.checkStatus(model.provider, started.providerJobId);
      }

      if (result.status !== 'completed' || !result.outputUrls?.length) {
        await this.fail(generation.id, generation.userId, generation.creditsCost, result.error || 'Generation timed out');
        return;
      }

      // Persist outputs to our own storage
      const outputUrls = await Promise.all(
        result.outputUrls.map((url, idx) =>
          this.storage
            .ingestFromUrl(url, this.storage.buildGenerationKey(generationId, idx))
            .catch(() => url), // fall back to provider URL if storage fails
        ),
      );

      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'COMPLETED',
          outputUrls,
          thumbnailUrl: outputUrls[0],
          completedAt: new Date(),
          processingMs: Date.now() - startedAt,
        },
      });

      this.gateway.emitProgress(generation.userId, {
        generationId,
        status: 'COMPLETED',
        outputUrls,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Generation ${generationId} failed: ${message}`);
      await this.fail(generation.id, generation.userId, generation.creditsCost, message);
    }
  }

  private buildInput(generation: {
    prompt: string | null;
    negativePrompt: string | null;
    inputImageUrl: string | null;
    params: unknown;
  }): Record<string, unknown> {
    const params = (generation.params as Record<string, unknown>) || {};
    return {
      ...(generation.prompt ? { prompt: generation.prompt } : {}),
      ...(generation.negativePrompt ? { negative_prompt: generation.negativePrompt } : {}),
      ...(generation.inputImageUrl ? { image: generation.inputImageUrl } : {}),
      ...params,
    };
  }

  private async fail(generationId: string, userId: string, creditsCost: number, errorMessage: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.generation.update({
        where: { id: generationId },
        data: { status: 'FAILED', errorMessage },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: creditsCost } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: creditsCost,
          type: 'GENERATION_REFUND',
          description: 'Refund for failed generation',
          generationId,
          balanceAfter: user.creditBalance,
        },
      });
    });

    this.gateway.emitProgress(userId, { generationId, status: 'FAILED', error: errorMessage });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
