import { IsString, IsOptional, IsEnum } from 'class-validator';
import { RoomType } from '@hospital-nav/shared-types';

export class CreateRoomDto {
  @IsString()
  floorId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  roomNumber: string;

  @IsString()
  name: string;

  @IsEnum(RoomType)
  type: RoomType;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;
}
