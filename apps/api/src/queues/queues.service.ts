import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SocketEvents, QueueEntryStatus } from '@hospital-nav/shared-types';

export interface QueueReceiptData {
  receiptId: string;
  tokenNumber: number;
  currentNumber: number;
  waitingCount: number;
  averageConsultationTime: number;
  estimatedWaitMinutes: number;
  createdAt: Date;
  patientName: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  hospitalName?: string;
}

export function buildQueueReceipt({
  tokenNumber,
  currentNumber,
  waitingCount,
  averageConsultationTime,
  createdAt,
  patientName,
  doctorName,
  departmentName,
  roomNumber,
  hospitalName = 'CityCare Hospital',
}: {
  tokenNumber: number;
  currentNumber: number;
  waitingCount: number;
  averageConsultationTime: number;
  createdAt: Date;
  patientName: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  hospitalName?: string;
}): QueueReceiptData {
  const patientsAhead = Math.max(0, tokenNumber - currentNumber);
  const estimatedWaitMinutes = patientsAhead * averageConsultationTime;

  return {
    receiptId: `RCPT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    tokenNumber,
    currentNumber,
    waitingCount,
    averageConsultationTime,
    estimatedWaitMinutes,
    createdAt,
    patientName,
    doctorName,
    departmentName,
    roomNumber,
    hospitalName,
  };
}

@Injectable()
export class QueuesService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async getDepartmentQueues(departmentId: string) {
    return this.prisma.queue.findMany({
      where: { departmentId, isActive: true },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  }

  async getDoctorQueue(doctorId: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { doctorId },
    });
    if (!queue) throw new NotFoundException('Queue not found for this doctor');
    return queue;
  }

  /**
   * Patient joins a doctor's queue
   */
  async joinQueue(doctorId: string, patientId: string) {
    const queue = await this.getDoctorQueue(doctorId);
    if (!queue.isActive) throw new BadRequestException('Queue is currently inactive');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { name: true } },
        department: { select: { name: true } },
        room: { select: { roomNumber: true } },
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: { select: { name: true } } },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const existing = await this.prisma.queueEntry.findFirst({
      where: { queueId: queue.id, patientId, status: QueueEntryStatus.WAITING },
    });
    if (existing) throw new BadRequestException('You are already in this queue');

    const updatedQueue = await this.prisma.queue.update({
      where: { id: queue.id },
      data: { waitingCount: { increment: 1 } },
    });

    const tokenNumber = updatedQueue.currentNumber + updatedQueue.waitingCount;

    const entry = await this.prisma.queueEntry.create({
      data: {
        queueId: queue.id,
        patientId,
        tokenNumber,
        status: QueueEntryStatus.WAITING,
      },
    });

    const receipt = buildQueueReceipt({
      tokenNumber,
      currentNumber: updatedQueue.currentNumber,
      waitingCount: updatedQueue.waitingCount,
      averageConsultationTime: updatedQueue.averageConsultationTime,
      createdAt: new Date(),
      patientName: patient.user.name,
      doctorName: doctor.user.name,
      departmentName: doctor.department?.name || 'General Care',
      roomNumber: doctor.room?.roomNumber || 'N/A',
    });

    this.broadcastQueueUpdate(updatedQueue);
    return {
      ...entry,
      tokenNumber,
      receipt,
      doctorName: doctor.user.name,
      departmentName: doctor.department?.name || 'General Care',
      roomNumber: doctor.room?.roomNumber || 'N/A',
    };
  }

  /**
   * Doctor calls next patient
   */
  async callNext(doctorId: string) {
    const queue = await this.getDoctorQueue(doctorId);
    if (queue.waitingCount === 0) throw new BadRequestException('Queue is empty');

    // Find next waiting patient
    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: { queueId: queue.id, status: QueueEntryStatus.WAITING },
      orderBy: { tokenNumber: 'asc' },
      include: { patient: { include: { user: { select: { name: true } } } } }
    });

    if (!nextEntry) throw new BadRequestException('No waiting patients found');

    // Transaction: update entry status, update queue counts
    const [updatedEntry, updatedQueue] = await this.prisma.$transaction([
      this.prisma.queueEntry.update({
        where: { id: nextEntry.id },
        data: { status: QueueEntryStatus.CALLED, calledAt: new Date() },
      }),
      this.prisma.queue.update({
        where: { id: queue.id },
        data: { 
          currentNumber: nextEntry.tokenNumber,
          waitingCount: { decrement: 1 } 
        },
      }),
    ]);

    this.broadcastQueueUpdate(updatedQueue);
    
    // Broadcast specific patient called event
    this.realtime.broadcast(SocketEvents.QUEUE_PATIENT_CALLED, {
      queueId: queue.id,
      tokenNumber: updatedEntry.tokenNumber,
      patientId: updatedEntry.patientId,
      doctorId,
      timestamp: new Date().toISOString()
    }, `patient_${updatedEntry.patientId}`);

    return updatedEntry;
  }

  /**
   * Doctor marks patient consultation as complete
   */
  async completePatient(doctorId: string, entryId: string) {
    const entry = await this.prisma.queueEntry.update({
      where: { id: entryId },
      data: { status: QueueEntryStatus.COMPLETED, completedAt: new Date() },
    });

    // Optionally update average consultation time here based on (completedAt - calledAt)
    return entry;
  }

  async getPatientPosition(doctorId: string, patientId: string) {
    const queue = await this.getDoctorQueue(doctorId);
    const entry = await this.prisma.queueEntry.findFirst({
      where: { queueId: queue.id, patientId, status: QueueEntryStatus.WAITING },
    });

    if (!entry) throw new NotFoundException('Patient is not waiting in this queue');

    // Count how many people are ahead
    const position = await this.prisma.queueEntry.count({
      where: {
        queueId: queue.id,
        status: QueueEntryStatus.WAITING,
        tokenNumber: { lt: entry.tokenNumber },
      },
    }) + 1; // 1-indexed position

    return {
      tokenNumber: entry.tokenNumber,
      position,
      estimatedWaitMinutes: position * queue.averageConsultationTime,
      currentToken: queue.currentNumber,
      totalWaiting: queue.waitingCount,
    };
  }

  private broadcastQueueUpdate(queue: any) {
    this.realtime.broadcast(SocketEvents.QUEUE_UPDATED, {
      queueId: queue.id,
      doctorId: queue.doctorId,
      departmentId: queue.departmentId,
      currentNumber: queue.currentNumber,
      waitingCount: queue.waitingCount,
      estimatedWaitMinutes: queue.waitingCount * queue.averageConsultationTime,
      timestamp: new Date().toISOString(),
    });
  }
}
