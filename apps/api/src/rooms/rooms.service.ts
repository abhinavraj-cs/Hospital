import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Room } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RoomUncheckedCreateInput): Promise<Room> {
    return this.prisma.room.create({ data });
  }

  async findAll(floorId?: string, departmentId?: string): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: {
        ...(floorId && { floorId }),
        ...(departmentId && { departmentId }),
      },
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(id: string, data: Prisma.RoomUpdateInput): Promise<Room> {
    try {
      return await this.prisma.room.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Room> {
    try {
      return await this.prisma.room.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }
}
