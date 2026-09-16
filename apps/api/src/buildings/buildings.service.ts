import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Building } from '@prisma/client';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BuildingUncheckedCreateInput): Promise<Building> {
    return this.prisma.building.create({ data });
  }

  async findAll(hospitalId?: string): Promise<Building[]> {
    return this.prisma.building.findMany({
      where: hospitalId ? { hospitalId } : undefined,
    });
  }

  async findOne(id: string): Promise<Building> {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        floors: true,
      },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }

    return building;
  }

  async update(id: string, data: Prisma.BuildingUpdateInput): Promise<Building> {
    try {
      return await this.prisma.building.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Building> {
    try {
      return await this.prisma.building.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
  }
}
