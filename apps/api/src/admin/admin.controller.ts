import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@hospital-nav/shared-types';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const [
      totalDoctors,
      availableDoctors,
      totalPatients,
      totalDepartments,
      totalRooms,
      activeQueues,
      waitingPatients,
    ] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.doctor.count({ where: { availabilityStatus: 'AVAILABLE' } }),
      this.prisma.patient.count(),
      this.prisma.department.count(),
      this.prisma.room.count(),
      this.prisma.queue.count({ where: { isActive: true } }),
      this.prisma.queueEntry.count({ where: { status: 'WAITING' } }),
    ]);

    return {
      totalDoctors,
      availableDoctors,
      totalPatients,
      totalDepartments,
      totalRooms,
      activeQueues,
      waitingPatients,
    };
  }

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        doctor: { select: { specialization: true, availabilityStatus: true } },
        patient: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('queue-overview')
  async getQueueOverview() {
    return this.prisma.queue.findMany({
      where: { isActive: true },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
        entries: {
          where: { status: 'WAITING' },
          orderBy: { tokenNumber: 'asc' },
          include: {
            patient: { include: { user: { select: { name: true, phone: true } } } },
          },
        },
      },
    });
  }
}
