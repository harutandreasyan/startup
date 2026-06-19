import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GenerationsController } from './generations.controller';
import { GenerationsService } from './generations.service';
import { GenerationProcessor } from './generation.processor';
import { GenerationsGateway } from './generations.gateway';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { StorageModule } from '../storage/storage.module';
import { GENERATION_QUEUE } from '../../config/queue';

@Module({
  imports: [
    BullModule.registerQueue({ name: GENERATION_QUEUE }),
    AiProvidersModule,
    StorageModule,
  ],
  controllers: [GenerationsController],
  providers: [GenerationsService, GenerationProcessor, GenerationsGateway],
})
export class GenerationsModule {}
