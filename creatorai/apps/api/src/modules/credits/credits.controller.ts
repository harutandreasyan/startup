import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('credits')
export class CreditsController {
  constructor(private prisma: PrismaService) {}

  @Get('balance')
  @UseGuards(AuthGuard)
  async getBalance(@CurrentUser() user: any) {
    return { balance: user.creditBalance };
  }

  @Get('history')
  @UseGuards(AuthGuard)
  async getHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page) : 1;
    const l = limit ? parseInt(limit) : 20;

    const [data, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.creditTransaction.count({ where: { userId: user.id } }),
    ]);

    return { data, total };
  }

  @Get('pricing')
  async getPricing() {
    return this.prisma.creditPack.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
