import { IsString, IsOptional } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  hospitalId: string;

  @IsString()
  name: string;

  @IsString()
  code: string;
}

export class UpdateBuildingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;
}
