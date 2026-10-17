import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPatientTokenDto {
  @IsString()
  patientName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  doctorId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  age?: number | string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @IsOptional()
  @IsString()
  existingPatientId?: string;

  @IsOptional()
  @IsString()
  priority?: string; // NORMAL, URGENT, EMERGENCY
}

export class UpdateTokenStatusDto {
  @IsString()
  status: string; // WAITING, CALLED, IN_PROGRESS, COMPLETED, SKIPPED, CANCELLED

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PrescriptionItemDto {
  @IsString()
  name: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsString()
  duration: string;
}

export class LabTestOrderDto {
  @IsString()
  testName: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sampleType?: string;
}

export class DoctorConsultationDto {
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescribeMedications?: PrescriptionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestOrderDto)
  orderLabTests?: LabTestOrderDto[];

  @IsOptional()
  @IsBoolean()
  dischargeImmediately?: boolean;
}

export class DispensePrescriptionDto {
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class VerifyLabReportDto {
  @IsString()
  summary: string;

  @IsString()
  results: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
