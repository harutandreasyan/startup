import { Body, Controller, Delete, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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

  // Tighter limits on credential endpoints to blunt brute-force / abuse.
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async register(
    @Body() body: { email: string; username: string; password: string; name?: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() body: { login: string; password: string }) {
    return this.authService.login(body.login, body.password);
  }

  @Patch('email')
  @UseGuards(AuthGuard)
  async changeEmail(@CurrentUser() user: any, @Body() body: { email: string }) {
    return this.authService.changeEmail(user.id, body.email);
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
