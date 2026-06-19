import { Controller, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Delete('account')
  @UseGuards(AuthGuard)
  async deleteAccount(@CurrentUser() user: any) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'DELETED' },
    });
    return { message: 'Account deleted' };
  }
}
