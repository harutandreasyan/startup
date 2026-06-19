import { Module } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { ReplicateProvider } from './replicate.provider';
import { PollinationsProvider } from './pollinations.provider';

@Module({
  providers: [AiProvidersService, ReplicateProvider, PollinationsProvider],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}
