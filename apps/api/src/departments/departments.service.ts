import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Department } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DepartmentUncheckedCreateInput): Promise<Department> {
    return this.prisma.department.create({ data });
  }

  async findAll(hospitalId?: string, floorId?: string): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: {
        ...(hospitalId && { hospitalId }),
        ...(floorId && { floorId }),
      },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        rooms: true,
        doctors: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    try {
      return await this.prisma.department.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Department> {
    try {
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }
}
