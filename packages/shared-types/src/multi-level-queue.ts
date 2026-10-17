// ============================================================
// Multi-Level Token Management & Patient Queue Types (LV1-LV5)
// ============================================================

export type WorkflowLevel = 
  | 'LV1_PATIENT' 
  | 'LV2_DOCTOR' 
  | 'LV3_PHARMACY' 
  | 'LV4_LAB_TEST' 
  | 'LV5_LAB_REPORT' 
  | 'COMPLETED';

export type TokenStatus = 
  | 'WAITING' 
  | 'CALLED' 
  | 'IN_PROGRESS' 
  | 'ON_HOLD'
  | 'COMPLETED' 
  | 'SKIPPED' 
  | 'CANCELLED';

export type EncounterPriority = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export interface MultiLevelToken {
  id: string;
  encounterId: string;
  patientId: string;
  level: WorkflowLevel;
  tokenCode: string; // e.g. PAT-101, DOC-201, PH-301, LAB-401, REP-501
  tokenNumber: number; // e.g. 101, 201, 301, 401, 501
  status: TokenStatus;
  departmentId?: string | null;
  doctorId?: string | null;
  notes?: string | null;
  parentTokenId?: string | null;
  calledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  encounterId: string;
  medicines: string; // JSON array of PrescriptionItem or formatted text
  instructions?: string | null;
  status: 'PENDING' | 'DISPENSED';
  dispensedAt?: string | null;
  dispensedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabTestRequest {
  id: string;
  encounterId: string;
  testName: string;
  testCategory?: string | null;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  sampleType?: string | null;
  collectedAt?: string | null;
  completedAt?: string | null;
  report?: LabReport | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabReport {
  id: string;
  labTestRequestId: string;
  reportTokenCode?: string | null;
  summary: string;
  results: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'DELIVERED';
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Encounter {
  id: string;
  encounterNumber: string;
  patientId: string;
  patient?: {
    id: string;
    userId: string;
    user?: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
  doctorId?: string | null;
  doctor?: {
    id: string;
    specialization: string;
    user?: {
      name: string;
    };
  } | null;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentLevel: WorkflowLevel;
  priority: EncounterPriority;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  tokens: MultiLevelToken[];
  prescriptions?: Prescription[];
  labRequests?: LabTestRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPatientTokenDto {
  patientName: string;
  phone?: string;
  email?: string;
  doctorId: string;
  departmentId?: string;
  chiefComplaint?: string;
  priority?: EncounterPriority;
}

export interface DoctorConsultationDto {
  diagnosis: string;
  notes?: string;
  prescribeMedications?: PrescriptionItem[];
  orderLabTests?: { testName: string; category?: string; sampleType?: string }[];
  dischargeImmediately?: boolean;
}
