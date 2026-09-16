import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateQrLocationDto {
  @IsString()
  nodeId: string;

  @IsString()
  code: string;

  @IsString()
  label: string;
}

export class UpdateQrLocationDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class ScanQrDto {
  @IsString()
  code: string;
}
