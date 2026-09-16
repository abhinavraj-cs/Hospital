// ============================================================
// Hospital, Building, Floor, Department, Room Types
// ============================================================

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact?: string;
  buildings?: Building[];
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  mapImageUrl?: string;
  building?: Building;
  departments?: Department[];
  rooms?: Room[];
}

export enum DepartmentCategory {
  CLINICAL = 'CLINICAL',
  DIAGNOSTIC = 'DIAGNOSTIC',
  EMERGENCY = 'EMERGENCY',
  SUPPORT = 'SUPPORT',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

export interface Department {
  id: string;
  floorId: string;
  hospitalId: string;
  name: string;
  code: string;
  description?: string;
  category: DepartmentCategory;
  floor?: Floor;
  doctors?: DoctorProfile[];
  rooms?: Room[];
}

export enum RoomType {
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  LABORATORY = 'LABORATORY',
  PHARMACY = 'PHARMACY',
  WAITING = 'WAITING',
  UTILITY = 'UTILITY',
  EMERGENCY = 'EMERGENCY',
  ICU = 'ICU',
  WARD = 'WARD',
  OFFICE = 'OFFICE',
}

export interface Room {
  id: string;
  floorId: string;
  departmentId?: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  floor?: Floor;
  department?: Department;
}

// Forward reference for circular deps
export interface DoctorProfile {
  id: string;
  userId: string;
  employeeId: string;
  specialization: string;
  departmentId: string;
  roomId?: string;
  availabilityStatus: DoctorStatus;
  user?: UserProfileBase;
  department?: Department;
  room?: Room;
}

interface UserProfileBase {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Re-export for convenience
import { DoctorStatus } from './doctor';
export { DoctorStatus } from './doctor';
