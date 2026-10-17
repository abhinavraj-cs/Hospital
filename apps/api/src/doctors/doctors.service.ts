import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Prisma, Doctor } from '@prisma/client';
import { SocketEvents, DoctorStatus } from '@hospital-nav/shared-types';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async create(data: Prisma.DoctorUncheckedCreateInput): Promise<Doctor> {
    return this.prisma.doctor.create({ data });
  }

  async findAll(departmentId?: string, status?: DoctorStatus): Promise<any[]> {
    return this.prisma.doctor.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(status && { availabilityStatus: status }),
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        department: {
          select: { name: true, code: true },
        },
        queues: {
          select: {
            currentNumber: true,
            waitingCount: true,
            averageConsultationTime: true,
          },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        department: true,
        room: true,
        queues: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async update(id: string, data: Prisma.DoctorUpdateInput): Promise<Doctor> {
    const doctor = await this.prisma.doctor.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
        room: true,
      },
    });
    this.realtime.broadcast(SocketEvents.DOCTOR_STATUS_UPDATED, {
      doctorId: id,
      timestamp: new Date().toISOString(),
    });
    return doctor;
  }

  async updateStatus(id: string, status: DoctorStatus): Promise<Doctor> {
    const doctor = await this.prisma.doctor.update({
      where: { id },
      data: { availabilityStatus: status },
      include: {
        user: { select: { name: true } },
      },
    });

    // Broadcast status change
    this.realtime.broadcast(SocketEvents.DOCTOR_STATUS_UPDATED, {
      doctorId: id,
      status: status,
      timestamp: new Date().toISOString(),
    });

    return doctor;
  }
}
