import { Body, Controller, Get, HttpException, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.toProfile(user, await this.activePlan(user.id));
  }

  @Get('me/stats')
  async getStats(@CurrentUser() user: any) {
    const [total, completed, byTypeRaw, spentAgg] = await Promise.all([
      this.prisma.generation.count({ where: { userId: user.id } }),
      this.prisma.generation.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      this.prisma.generation.groupBy({
        by: ['type'],
        where: { userId: user.id, status: 'COMPLETED' },
        _count: { _all: true },
      }),
      this.prisma.generation.aggregate({
        where: { userId: user.id, status: 'COMPLETED' },
        _sum: { creditsCost: true },
      }),
    ]);

    const byType = byTypeRaw
      .map((r) => ({ type: r.type, count: r._count._all }))
      .sort((a, b) => b.count - a.count);

    return {
      totalGenerations: total,
      completedGenerations: completed,
      creditsSpent: spentAgg._sum.creditsCost ?? 0,
      byType,
    };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() body: { name?: string; avatarUrl?: string }) {
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : undefined;

    let avatarUrl: string | undefined;
    if (typeof body.avatarUrl === 'string') {
      const v = body.avatarUrl.trim();
      // Accept an http(s) URL or a small data URL (client resizes before upload).
      const isDataUrl = v.startsWith('data:image/');
      const isHttp = v.startsWith('http://') || v.startsWith('https://');
      if (v === '') avatarUrl = '';
      else if ((isDataUrl || isHttp) && v.length <= 500_000) avatarUrl = v;
      else throw new HttpException('Invalid or too large avatar image.', 400);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      },
    });
    return this.toProfile(updated, await this.activePlan(user.id));
  }

  private async activePlan(userId: string): Promise<'FREE' | 'PRO' | 'BUSINESS'> {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
      orderBy: { currentPeriodEnd: 'desc' },
    });
    return sub?.plan ?? 'FREE';
  }

  private toProfile(user: any, plan: 'FREE' | 'PRO' | 'BUSINESS') {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      creditBalance: user.creditBalance,
      plan,
    };
  }
}
