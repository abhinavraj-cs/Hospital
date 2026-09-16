import { Module } from '@nestjs/common';
import { QrLocationService } from './qr-location.service';
import { QrLocationController } from './qr-location.controller';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports: [NavigationModule],
  controllers: [QrLocationController],
  providers: [QrLocationService],
  exports: [QrLocationService],
})
export class QrLocationModule {}
