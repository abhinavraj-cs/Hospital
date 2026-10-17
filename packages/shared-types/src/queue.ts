// ============================================================
// Queue Management Types
// ============================================================

export enum QueueEntryStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  SKIPPED = 'SKIPPED',
}

export interface Queue {
  id: string;
  doctorId: string;
  departmentId: string;
  currentNumber: number;
  waitingCount: number;
  averageConsultationTime: number;
  isActive: boolean;
  updatedAt: string;
}

export interface QueueEntry {
  id: string;
  queueId: string;
  patientId: string;
  tokenNumber: number;
  status: QueueEntryStatus;
  joinedAt: string;
  calledAt?: string;
  completedAt?: string;
  patient?: {
    id: string;
    user: {
      name: string;
      phone?: string;
    };
  };
}

export interface QueuePosition {
  tokenNumber: number;
  position: number;
  estimatedWaitMinutes: number;
  currentToken: number;
  totalWaiting: number;
}

export interface QueueUpdate {
  queueId: string;
  doctorId: string;
  departmentId: string;
  currentNumber: number;
  waitingCount: number;
  estimatedWaitMinutes: number;
  timestamp: string;
}

export interface PatientCalledEvent {
  queueId: string;
  tokenNumber: number;
  patientId: string;
  doctorId: string;
  roomId?: string;
  timestamp: string;
}
