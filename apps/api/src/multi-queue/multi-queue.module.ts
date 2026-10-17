import { Module } from '@nestjs/common';
import { MultiQueueController } from './multi-queue.controller';
import { MultiQueueService } from './multi-queue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [MultiQueueController],
  providers: [MultiQueueService],
  exports: [MultiQueueService],
})
export class MultiQueueModule {}
