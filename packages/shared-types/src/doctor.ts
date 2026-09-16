// ============================================================
// Doctor & Availability Types
// ============================================================

export enum DoctorStatus {
  AVAILABLE = 'AVAILABLE',
  ON_BREAK = 'ON_BREAK',
  IN_CONSULTATION = 'IN_CONSULTATION',
  UNAVAILABLE = 'UNAVAILABLE',
  EMERGENCY = 'EMERGENCY',
}

export interface Doctor {
  id: string;
  userId: string;
  employeeId: string;
  specialization: string;
  departmentId: string;
  roomId?: string;
  availabilityStatus: DoctorStatus;
  consultationStart?: string;
  consultationEnd?: string;
  currentQueueSize: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    name: string;
  };
  queue?: QueueInfo;
  createdAt: string;
  updatedAt: string;
}

export interface QueueInfo {
  id: string;
  currentNumber: number;
  waitingCount: number;
  averageConsultationTime: number;
  estimatedWaitMinutes: number;
}

export interface DoctorStatusUpdate {
  doctorId: string;
  status: DoctorStatus;
  timestamp: string;
}
