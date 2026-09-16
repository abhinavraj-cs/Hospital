import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Hospital } from '@prisma/client';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.HospitalCreateInput): Promise<Hospital> {
    return this.prisma.hospital.create({ data });
  }

  async findAll(): Promise<Hospital[]> {
    return this.prisma.hospital.findMany();
  }

  async findOne(id: string): Promise<Hospital> {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        buildings: true,
      },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return hospital;
  }

  async update(id: string, data: Prisma.HospitalUpdateInput): Promise<Hospital> {
    try {
      return await this.prisma.hospital.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Hospital> {
    try {
      return await this.prisma.hospital.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
  }
}
