import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { getRedisConnection } from './config/queue';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GenerationsModule } from './modules/generations/generations.module';
import { CreditsModule } from './modules/credits/credits.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ModelsModule } from './modules/models/models.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRoot({ connection: getRedisConnection() }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GenerationsModule,
    CreditsModule,
    PaymentsModule,
    ModelsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
