import { Injectable, HttpException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GENERATION_QUEUE, type GenerationJobData } from '../../config/queue';

// Tools that run in the user's browser and POST their finished result back to be saved.
const CLIENT_TOOL_TYPES = new Set(['BACKGROUND_REMOVAL', 'UPSCALE']);

@Injectable()
export class GenerationsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @InjectQueue(GENERATION_QUEUE) private generationQueue: Queue<GenerationJobData>,
  ) {}

  /**
   * Save a result produced entirely client-side (e.g. background removal, upscale).
   * No credits, no queue — the image arrives finished as a base64 data URL. Stored in
   * R2 when configured, otherwise kept inline (fine for local/MVP).
   */
  async importClientResult(
    userId: string,
    data: { type: string; image: string; thumbnail?: string; prompt?: string },
  ) {
    const { type, image, thumbnail, prompt } = data;
    if (!CLIENT_TOOL_TYPES.has(type)) throw new HttpException('Unsupported tool type', 400);
    if (!image?.startsWith('data:image/')) throw new HttpException('Invalid image', 400);
    // base64 length ≈ bytes * 1.37 — cap ~10 MB of image.
    if (image.length > 14_000_000) throw new HttpException('Image too large', 413);

    const gen = await this.prisma.generation.create({
      data: {
        userId,
        type: type as any,
        model: 'browser',
        provider: 'client',
        prompt: prompt?.slice(0, 500),
        params: {},
        creditsCost: 0,
        status: 'COMPLETED',
        outputUrls: [],
        completedAt: new Date(),
      },
    });

    let outputUrls = [image];
    let thumbnailUrl = thumbnail || image;
    if (this.storage.isConfigured()) {
      outputUrls = [await this.storage.ingestDataUrl(image, this.storage.buildGenerationKey(gen.id, 0))];
      thumbnailUrl = thumbnail
        ? await this.storage.ingestDataUrl(thumbnail, `generations/${gen.id}/thumb.png`)
        : outputUrls[0];
    }

    return this.prisma.generation.update({
      where: { id: gen.id },
      data: { outputUrls, thumbnailUrl },
    });
  }

  async create(userId: string, data: {
    type: string;
    model: string;
    prompt?: string;
    negativePrompt?: string;
    inputImageUrl?: string;
    params?: Record<string, unknown>;
  }) {
    const aiModel = await this.prisma.aiModel.findUnique({
      where: { slug: data.model },
    });
    if (!aiModel) throw new HttpException('Model not found', 404);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.creditBalance < aiModel.creditCost) {
      throw new HttpException('Insufficient credits', 402);
    }

    const generation = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: aiModel.creditCost } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -aiModel.creditCost,
          type: 'GENERATION_DEBIT',
          description: `${aiModel.name} generation`,
          balanceAfter: updatedUser.creditBalance,
        },
      });

      return tx.generation.create({
        data: {
          userId,
          type: data.type as any,
          model: data.model,
          prompt: data.prompt,
          negativePrompt: data.negativePrompt,
          inputImageUrl: data.inputImageUrl,
          params: (data.params || {}) as any,
          creditsCost: aiModel.creditCost,
          provider: aiModel.provider,
          status: 'QUEUED',
        },
      });
    });

    await this.generationQueue.add(
      'process',
      { generationId: generation.id },
      { attempts: 1, removeOnComplete: 100, removeOnFail: 100 },
    );

    return generation;
  }

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generation.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  async findOne(id: string, userId: string) {
    const generation = await this.prisma.generation.findFirst({
      where: { id, userId },
    });
    if (!generation) throw new HttpException('Generation not found', 404);
    return generation;
  }

  async delete(id: string, userId: string) {
    const generation = await this.findOne(id, userId);
    await this.prisma.generation.delete({ where: { id: generation.id } });
    return { message: 'Deleted' };
  }
}
