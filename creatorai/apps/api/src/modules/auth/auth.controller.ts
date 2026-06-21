import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string; name?: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { login: string; password: string }) {
    return this.authService.login(body.login, body.password);
  }

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
