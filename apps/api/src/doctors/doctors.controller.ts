import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, DoctorStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class UpdateDoctorStatusDto {
  @IsEnum(DoctorStatus)
  status: DoctorStatus;
}

class UpdateDoctorDto {
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() roomId?: string;
  @IsOptional() @IsString() consultationStart?: string;
  @IsOptional() @IsString() consultationEnd?: string;
  @IsOptional() @IsEnum(DoctorStatus) availabilityStatus?: DoctorStatus;
}

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: DoctorStatus,
  ) {
    return this.doctorsService.findAll(departmentId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateDoctorStatusDto,
  ) {
    return this.doctorsService.updateStatus(id, body.status);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, body);
  }
}
