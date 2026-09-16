// ============================================================
// User & Authentication Types
// ============================================================

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum Language {
  EN = 'en',
  HI = 'hi',
  GU = 'gu',
}

export interface UserBase {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: Language;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  preferredLanguage?: Language;
}

export interface AuthResponse {
  user: UserBase;
  tokens: AuthTokens;
}
