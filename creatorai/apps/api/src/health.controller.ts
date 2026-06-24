import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from './modules/prisma/prisma.service';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('/health')
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: true };
    } catch {
      return { status: 'degraded', db: false };
    }
  }
}
