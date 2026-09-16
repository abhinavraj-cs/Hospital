import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('destinations')
  getDestinations(@Query('hospitalId') hospitalId?: string) {
    return this.emergencyService.getDestinations(hospitalId);
  }

  @Get('route')
  getRoute(
    @Query('from') from: string,
    @Query('to') to?: string,
  ) {
    if (!from) {
      throw new BadRequestException('Current location node ID (from) is required');
    }
    return this.emergencyService.getEmergencyRoute(from, to);
  }
}
