import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.toProfile(user);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() body: { name?: string }) {
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : undefined;
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { ...(name !== undefined ? { name } : {}) },
    });
    return this.toProfile(updated);
  }

  private toProfile(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      creditBalance: user.creditBalance,
      plan: 'FREE',
    };
  }
}
