import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DepartmentCategory } from '@prisma/client';

export class CreateDepartmentDto {
  @IsString()
  floorId: string;

  @IsString()
  hospitalId: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DepartmentCategory)
  category: DepartmentCategory;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DepartmentCategory)
  @IsOptional()
  category?: DepartmentCategory;
}
