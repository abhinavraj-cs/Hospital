import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { QrLocationService } from './qr-location.service';
import { CreateQrLocationDto, UpdateQrLocationDto, ScanQrDto } from './dto/qr-location.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@hospital-nav/shared-types';

@Controller('qr')
export class QrLocationController {
  constructor(private readonly qrLocationService: QrLocationService) {}

  @Post('scan')
  scan(@Body() scanQrDto: ScanQrDto) {
    return this.qrLocationService.processScan(scanQrDto.code);
  }

  @Get('generate/:code')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  generateImage(@Param('code') code: string) {
    return this.qrLocationService.generateImage(code);
  }

  @Post('locations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() createQrLocationDto: CreateQrLocationDto) {
    return this.qrLocationService.create(createQrLocationDto);
  }

  @Get('locations')
  findAll() {
    return this.qrLocationService.findAll();
  }

  @Get('locations/:id')
  findOne(@Param('id') id: string) {
    return this.qrLocationService.findOne(id);
  }

  @Patch('locations/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateQrLocationDto: UpdateQrLocationDto) {
    return this.qrLocationService.update(id, updateQrLocationDto);
  }

  @Delete('locations/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.qrLocationService.remove(id);
  }
}
