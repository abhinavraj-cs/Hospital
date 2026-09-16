import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFloorDto {
  @IsString()
  buildingId: string;

  @IsNumber()
  floorNumber: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  mapImageUrl?: string;
}

export class UpdateFloorDto {
  @IsNumber()
  @IsOptional()
  floorNumber?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  mapImageUrl?: string;
}
