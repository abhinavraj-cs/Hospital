import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Floor } from '@prisma/client';

@Injectable()
export class FloorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FloorUncheckedCreateInput): Promise<Floor> {
    return this.prisma.floor.create({ data });
  }

  async findAll(buildingId?: string): Promise<Floor[]> {
    return this.prisma.floor.findMany({
      where: buildingId ? { buildingId } : undefined,
    });
  }

  async findOne(id: string): Promise<Floor> {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: {
        departments: true,
        rooms: true,
      },
    });

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }

    return floor;
  }

  async update(id: string, data: Prisma.FloorUpdateInput): Promise<Floor> {
    try {
      return await this.prisma.floor.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Floor> {
    try {
      return await this.prisma.floor.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }
  }
}
