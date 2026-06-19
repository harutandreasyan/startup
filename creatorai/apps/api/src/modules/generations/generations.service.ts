import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenerationsService {
  constructor(private prisma: PrismaService) {}

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
          params: data.params || {},
          creditsCost: aiModel.creditCost,
          provider: aiModel.provider,
          status: 'QUEUED',
        },
      });
    });

    // TODO: Add to BullMQ queue for async processing
    // await this.generationQueue.add('process', { generationId: generation.id });

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
