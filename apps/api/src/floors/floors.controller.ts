import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FloorsService } from './floors.service';
import { CreateFloorDto, UpdateFloorDto } from './dto/floor.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('floors')
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() createFloorDto: CreateFloorDto) {
    return this.floorsService.create(createFloorDto);
  }

  @Get()
  findAll(@Query('buildingId') buildingId?: string) {
    return this.floorsService.findAll(buildingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateFloorDto: UpdateFloorDto) {
    return this.floorsService.update(id, updateFloorDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.floorsService.remove(id);
  }
}
