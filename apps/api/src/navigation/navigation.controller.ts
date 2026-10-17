import { Controller, Get, Query, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { RoutePreference } from '@hospital-nav/shared-types';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@hospital-nav/shared-types';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get('route')
  async getRoute(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('preference') preferenceStr?: string,
  ) {
    if (!from || !to) {
      throw new BadRequestException('Missing required parameters: from, to');
    }

    const preference = (preferenceStr as RoutePreference) || RoutePreference.SHORTEST;
    return this.navigationService.getRoute(from, to, preference);
  }

  @Get('nodes')
  getNodes(@Query('floorId') floorId?: string) {
    return this.navigationService.getNodes(floorId);
  }

  @Get('edges')
  getEdges() {
    return this.navigationService.getEdges();
  }

  @Post('reload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async reloadGraph() {
    await this.navigationService.reloadGraph();
    return { success: true, message: 'Graph reloaded successfully' };
  }
}
