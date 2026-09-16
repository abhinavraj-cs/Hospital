// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// Socket.IO Event Names
// ============================================================

export const SocketEvents = {
  // Doctor events
  DOCTOR_STATUS_UPDATED: 'doctor.status.updated',
  DOCTOR_CONSULTATION_STARTED: 'doctor.consultation.started',
  DOCTOR_CONSULTATION_ENDED: 'doctor.consultation.ended',

  // Queue events
  QUEUE_UPDATED: 'queue.updated',
  QUEUE_PATIENT_CALLED: 'queue.patient.called',
  QUEUE_PATIENT_COMPLETED: 'queue.patient.completed',

  // Emergency events
  EMERGENCY_ACTIVATED: 'emergency.activated',
  EMERGENCY_UPDATED: 'emergency.updated',

  // Hospital events
  HOSPITAL_UPDATED: 'hospital.updated',
  DEPARTMENT_UPDATED: 'hospital.department.updated',
  NAVIGATION_NODE_UPDATED: 'navigation.node.updated',
  NAVIGATION_EDGE_UPDATED: 'navigation.edge.updated',

  // Connection events
  JOIN_HOSPITAL: 'join.hospital',
  JOIN_DEPARTMENT: 'join.department',
  LEAVE_HOSPITAL: 'leave.hospital',
  LEAVE_DEPARTMENT: 'leave.department',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];

// ============================================================
// Emergency Types
// ============================================================

export enum EmergencyDestinationType {
  EMERGENCY_DEPARTMENT = 'EMERGENCY_DEPARTMENT',
  TRAUMA_CENTRE = 'TRAUMA_CENTRE',
  ICU = 'ICU',
  BLOOD_BANK = 'BLOOD_BANK',
  AMBULANCE_ENTRANCE = 'AMBULANCE_ENTRANCE',
}

export interface EmergencyDestination {
  id: string;
  name: string;
  type: EmergencyDestinationType;
  nodeId: string;
  floorId: string;
  building: string;
  floor: string;
}
