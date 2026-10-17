import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { 
  RegisterPatientTokenDto, 
  DoctorConsultationDto, 
  UpdateTokenStatusDto,
  VerifyLabReportDto
} from './dto/multi-queue.dto';

@Injectable()
export class MultiQueueService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  /**
   * Generates a collision-safe, sequential token number for a specific level.
   * LV1: 101+, LV2: 201+, LV3: 301+, LV4: 401+, LV5: 501+
   */
  private async getNextTokenSequence(level: string): Promise<{ tokenNumber: number; tokenCode: string }> {
    let baseOffset = 100;
    let prefix = 'PAT';

    switch (level) {
      case 'LV1_PATIENT':
        baseOffset = 100;
        prefix = 'PAT';
        break;
      case 'LV2_DOCTOR':
        baseOffset = 200;
        prefix = 'DOC';
        break;
      case 'LV3_PHARMACY':
        baseOffset = 300;
        prefix = 'PH';
        break;
      case 'LV4_LAB_TEST':
        baseOffset = 400;
        prefix = 'LAB';
        break;
      case 'LV5_LAB_REPORT':
        baseOffset = 500;
        prefix = 'REP';
        break;
      default:
        baseOffset = 100;
        prefix = 'TOK';
    }

    const count = await this.prisma.multiLevelToken.count({
      where: { level },
    });

    const tokenNumber = baseOffset + count + 1;
    const tokenCode = `${prefix}-${tokenNumber}`;
    return { tokenNumber, tokenCode };
  }

  /**
   * 1. Patient Registration & Token Generation (LV1 -> LV2)
   */
  async registerPatient(dto: RegisterPatientTokenDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { department: true, user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const departmentId = dto.departmentId || doctor.departmentId;

    // Check if patient exists by phone or email, else create
    let patient = await this.prisma.patient.findFirst({
      where: {
        user: {
          OR: [
            ...(dto.phone ? [{ phone: dto.phone }] : []),
            ...(dto.email ? [{ email: dto.email }] : []),
          ],
        },
      },
      include: { user: true },
    });

    if (!patient) {
      const email = dto.email || `patient.${Date.now()}@hospital.local`;
      const user = await this.prisma.user.create({
        data: {
          name: dto.patientName,
          email,
          phone: dto.phone || null,
          role: 'PATIENT',
          passwordHash: 'PATIENT_PASS_HASH',
        },
      });

      patient = await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
        include: { user: true },
      });
    }

    // Check for duplicate active encounter
    const existingActive = await this.prisma.encounter.findFirst({
      where: {
        patientId: patient.id,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      throw new ConflictException(
        `Patient already has an active hospital encounter (${existingActive.encounterNumber}). Complete or cancel it first.`
      );
    }

    // Generate Encounter Number
    const encounterCount = await this.prisma.encounter.count();
    const encounterNumber = `ENC-${new Date().getFullYear()}-${1000 + encounterCount + 1}`;

    // Generate LV1 Patient Token (e.g. PAT-101)
    const lv1 = await this.getNextTokenSequence('LV1_PATIENT');
    // Generate LV2 Doctor Token (e.g. DOC-201)
    const lv2 = await this.getNextTokenSequence('LV2_DOCTOR');

    // Execute atomic creation inside transaction
    const encounter = await this.prisma.$transaction(async (tx) => {
      const enc = await tx.encounter.create({
        data: {
          encounterNumber,
          patientId: patient.id,
          doctorId: doctor.id,
          departmentId,
          status: 'ACTIVE',
          currentLevel: 'LV2_DOCTOR', // Registered, now queued for doctor
          priority: dto.isEmergency ? 'EMERGENCY' : (dto.priority || 'NORMAL'),
          chiefComplaint: dto.symptoms || dto.chiefComplaint || 'General OPD consultation',
        },
      });

      // Create LV1 Token (Completed upon registration)
      const t1 = await tx.multiLevelToken.create({
        data: {
          encounterId: enc.id,
          patientId: patient.id,
          level: 'LV1_PATIENT',
          tokenCode: lv1.tokenCode,
          tokenNumber: lv1.tokenNumber,
          status: 'COMPLETED',
          notes: 'Registration completed',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Create LV2 Doctor Token (Waiting in Doctor's Queue)
      await tx.multiLevelToken.create({
        data: {
          encounterId: enc.id,
          patientId: patient.id,
          level: 'LV2_DOCTOR',
          tokenCode: lv2.tokenCode,
          tokenNumber: lv2.tokenNumber,
          status: 'WAITING',
          departmentId,
          doctorId: doctor.id,
          parentTokenId: t1.id,
          notes: `Assigned to Dr. ${doctor.user.name}`,
        },
      });

      return enc;
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounter.id);
  }

  /**
   * 2. Doctor Consultation & Conditional Routing (LV2 -> LV3 / LV4 / Exit)
   */
  async processDoctorConsultation(encounterId: string, dto: DoctorConsultationDto) {
    const encounter = await this.prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        tokens: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!encounter) throw new NotFoundException('Encounter not found');
    if (encounter.status !== 'ACTIVE') throw new BadRequestException('Encounter is already concluded');

    // Find active LV2 Doctor Token
    const doctorToken = encounter.tokens.find((t) => t.level === 'LV2_DOCTOR' && t.status !== 'COMPLETED');
    if (!doctorToken) {
      throw new BadRequestException('No active doctor token found for this encounter');
    }

    const medications = dto.prescribeMedications || [];
    const labTests = dto.orderLabTests || [];
    const hasMeds = medications.length > 0;
    const hasTests = labTests.length > 0;
    const discharge = dto.dischargeImmediately || (!hasMeds && !hasTests);

    // Determine next workflow stage
    let nextLevel = 'COMPLETED';
    if (hasTests) {
      nextLevel = 'LV4_LAB_TEST';
    } else if (hasMeds) {
      nextLevel = 'LV3_PHARMACY';
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark LV2 Doctor Token as COMPLETED
      await tx.multiLevelToken.update({
        where: { id: doctorToken.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          notes: `Diagnosis: ${dto.diagnosis}. ${dto.notes || ''}`.trim(),
        },
      });

      // 2. Update Encounter
      await tx.encounter.update({
        where: { id: encounterId },
        data: {
          diagnosis: dto.diagnosis,
          currentLevel: discharge ? 'COMPLETED' : nextLevel,
          status: discharge ? 'COMPLETED' : 'ACTIVE',
        },
      });

      // 3. Conditional: Create Prescription & LV3 Pharmacy Token if medications ordered
      if (hasMeds) {
        const lv3 = await this.getNextTokenSequence('LV3_PHARMACY');
        await tx.prescription.create({
          data: {
            encounterId,
            medicines: JSON.stringify(medications),
            instructions: dto.notes || 'Take as advised by physician',
            status: 'PENDING',
          },
        });

        await tx.multiLevelToken.create({
          data: {
            encounterId,
            patientId: encounter.patientId,
            level: 'LV3_PHARMACY',
            tokenCode: lv3.tokenCode,
            tokenNumber: lv3.tokenNumber,
            status: 'WAITING',
            parentTokenId: doctorToken.id,
            notes: `${medications.length} medicines prescribed`,
          },
        });
      }

      // 4. Conditional: Create Lab Requests & LV4 Lab Test Token if tests ordered
      if (hasTests) {
        const lv4 = await this.getNextTokenSequence('LV4_LAB_TEST');

        for (const test of labTests) {
          await tx.labTestRequest.create({
            data: {
              encounterId,
              testName: test.testName,
              testCategory: test.category || 'Diagnostics',
              sampleType: test.sampleType || 'Blood',
              status: 'PENDING',
            },
          });
        }

        await tx.multiLevelToken.create({
          data: {
            encounterId,
            patientId: encounter.patientId,
            level: 'LV4_LAB_TEST',
            tokenCode: lv4.tokenCode,
            tokenNumber: lv4.tokenNumber,
            status: 'WAITING',
            parentTokenId: doctorToken.id,
            notes: `${labTests.length} tests ordered (${labTests.map(t => t.testName).join(', ')})`,
          },
        });
      }
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounterId);
  }

  /**
   * 3. Medical / Pharmacy Dispensing (LV3)
   */
  async dispensePharmacy(prescriptionId: string, instructions?: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { encounter: { include: { tokens: true, labRequests: true } } },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');
    if (prescription.status === 'DISPENSED') throw new BadRequestException('Prescription already dispensed');

    const encounter = prescription.encounter;
    const pharmacyToken = encounter.tokens.find((t) => t.level === 'LV3_PHARMACY' && t.status !== 'COMPLETED');

    await this.prisma.$transaction(async (tx) => {
      // Mark prescription as DISPENSED
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: 'DISPENSED',
          dispensedAt: new Date(),
          instructions: instructions || prescription.instructions,
        },
      });

      // Complete LV3 Pharmacy Token
      if (pharmacyToken) {
        await tx.multiLevelToken.update({
          where: { id: pharmacyToken.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            notes: 'Medicines dispensed to patient',
          },
        });
      }

      // Check if all other tasks are complete
      const pendingLabRequests = encounter.labRequests.some((lr) => lr.status !== 'COMPLETED');
      if (!pendingLabRequests) {
        await tx.encounter.update({
          where: { id: encounter.id },
          data: { currentLevel: 'COMPLETED', status: 'COMPLETED' },
        });
      }
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounter.id);
  }

  /**
   * 4. Lab Test Sample Collection & Processing (LV4)
   */
  async collectLabSample(requestId: string) {
    const req = await this.prisma.labTestRequest.findUnique({
      where: { id: requestId },
      include: { encounter: { include: { tokens: true } } },
    });
    if (!req) throw new NotFoundException('Lab test request not found');

    const encounter = req.encounter;
    const labToken = encounter.tokens.find((t) => t.level === 'LV4_LAB_TEST' && t.status === 'WAITING');

    await this.prisma.$transaction(async (tx) => {
      await tx.labTestRequest.update({
        where: { id: requestId },
        data: {
          status: 'SAMPLE_COLLECTED',
          collectedAt: new Date(),
        },
      });

      if (labToken) {
        await tx.multiLevelToken.update({
          where: { id: labToken.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            notes: `Sample collected for ${req.testName}`,
          },
        });
      }
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounter.id);
  }

  /**
   * 4b. Complete Lab Test & Auto-generate LV5 Lab Report Token (LV4 -> LV5)
   */
  async completeLabTest(requestId: string) {
    const req = await this.prisma.labTestRequest.findUnique({
      where: { id: requestId },
      include: { encounter: { include: { tokens: true } } },
    });
    if (!req) throw new NotFoundException('Lab test request not found');

    const encounter = req.encounter;
    const labToken = encounter.tokens.find((t) => t.level === 'LV4_LAB_TEST' && t.status !== 'COMPLETED');

    const lv5 = await this.getNextTokenSequence('LV5_LAB_REPORT');

    await this.prisma.$transaction(async (tx) => {
      // Complete lab test
      await tx.labTestRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Complete LV4 Token
      if (labToken) {
        await tx.multiLevelToken.update({
          where: { id: labToken.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            notes: `Test completed for ${req.testName}`,
          },
        });
      }

      // Generate LV5 Lab Report Token
      const rToken = await tx.multiLevelToken.create({
        data: {
          encounterId: encounter.id,
          patientId: encounter.patientId,
          level: 'LV5_LAB_REPORT',
          tokenCode: lv5.tokenCode,
          tokenNumber: lv5.tokenNumber,
          status: 'WAITING',
          parentTokenId: labToken?.id,
          notes: `Lab report pending verification for ${req.testName}`,
        },
      });

      // Create initial LabReport
      await tx.labReport.create({
        data: {
          labTestRequestId: req.id,
          reportTokenCode: lv5.tokenCode,
          summary: `Pending pathologist verification for ${req.testName}`,
          results: JSON.stringify({ status: 'Awaiting values', test: req.testName }),
          status: 'PENDING_VERIFICATION',
        },
      });

      // Update encounter current level to LV5
      await tx.encounter.update({
        where: { id: encounter.id },
        data: { currentLevel: 'LV5_LAB_REPORT' },
      });
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounter.id);
  }

  /**
   * 5. Lab Report Verification & Delivery (LV5 -> Completed)
   */
  async verifyLabReport(reportId: string, dto: VerifyLabReportDto) {
    const report = await this.prisma.labReport.findUnique({
      where: { id: reportId },
      include: { 
        labTestRequest: { 
          include: { 
            encounter: { 
              include: { tokens: true, prescriptions: true } 
            } 
          } 
        } 
      },
    });

    if (!report) throw new NotFoundException('Lab report not found');

    const encounter = report.labTestRequest.encounter;
    const reportToken = encounter.tokens.find((t) => t.level === 'LV5_LAB_REPORT' && t.status !== 'COMPLETED');

    await this.prisma.$transaction(async (tx) => {
      // Verify report
      await tx.labReport.update({
        where: { id: reportId },
        data: {
          summary: dto.summary,
          results: dto.results,
          verifiedBy: dto.verifiedBy || 'Dr. Pathologist',
          verifiedAt: new Date(),
          deliveredAt: new Date(),
          status: 'DELIVERED',
        },
      });

      // Complete LV5 Token
      if (reportToken) {
        await tx.multiLevelToken.update({
          where: { id: reportToken.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            notes: `Report verified and delivered (${dto.summary})`,
          },
        });
      }

      // If prescriptions are either not present or already dispensed, complete the encounter
      const pendingPrescriptions = encounter.prescriptions.some((p) => p.status !== 'DISPENSED');
      if (!pendingPrescriptions) {
        await tx.encounter.update({
          where: { id: encounter.id },
          data: { currentLevel: 'COMPLETED', status: 'COMPLETED' },
        });
      }
    });

    this.broadcastUpdate();
    return this.getEncounterById(encounter.id);
  }

  /**
   * Update Token Status directly (CALLED, IN_PROGRESS, COMPLETED, SKIPPED, CANCELLED)
   */
  async updateTokenStatus(tokenId: string, dto: UpdateTokenStatusDto) {
    const token = await this.prisma.multiLevelToken.findUnique({
      where: { id: tokenId },
      include: { encounter: true },
    });
    if (!token) throw new NotFoundException('Token not found');

    const updateData: any = {
      status: dto.status,
      notes: dto.notes ? `${token.notes || ''} | ${dto.notes}` : token.notes,
    };

    if (dto.status === 'CALLED') updateData.calledAt = new Date();
    if (dto.status === 'IN_PROGRESS') updateData.startedAt = new Date();
    if (dto.status === 'COMPLETED') updateData.completedAt = new Date();

    const updated = await this.prisma.multiLevelToken.update({
      where: { id: tokenId },
      data: updateData,
    });

    this.broadcastUpdate();
    return updated;
  }

  /**
   * Stage Queue Query (e.g. for LV2 Doctor, LV3 Pharmacy, LV4 Lab, LV5 Report)
   */
  async getStageQueue(level: string) {
    const tokens = await this.prisma.multiLevelToken.findMany({
      where: { level },
      include: {
        encounter: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
            prescriptions: true,
            labRequests: { include: { report: true } },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { tokenNumber: 'asc' },
      ],
    });

    const activeToken = tokens.find((t) => t.status === 'CALLED' || t.status === 'IN_PROGRESS');
    const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
    const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');

    const nextToken = waitingTokens[0] || null;

    return {
      level,
      totalCount: tokens.length,
      currentActiveToken: activeToken || null,
      nextWaitingToken: nextToken || null,
      waitingCount: waitingTokens.length,
      completedCount: completedTokens.length,
      tokens,
    };
  }

  /**
   * Comprehensive Central Token Tracking & Timeline
   */
  async trackToken(tokenCode: string) {
    const clean = tokenCode.trim().toUpperCase();

    const token = await this.prisma.multiLevelToken.findUnique({
      where: { tokenCode: clean },
      include: {
        encounter: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true, department: true } },
            tokens: { orderBy: { tokenNumber: 'asc' } },
            prescriptions: true,
            labRequests: { include: { report: true } },
          },
        },
      },
    });

    if (!token) {
      // Also try finding by encounterNumber
      const encounter = await this.prisma.encounter.findUnique({
        where: { encounterNumber: clean },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true, department: true } },
          tokens: { orderBy: { tokenNumber: 'asc' } },
          prescriptions: true,
          labRequests: { include: { report: true } },
        },
      });

      if (!encounter) throw new NotFoundException(`No token or encounter found for code ${clean}`);
      return encounter;
    }

    return token.encounter;
  }

  /**
   * List all Encounters with their full 5-level journey
   */
  async getEncounters() {
    return this.prisma.encounter.findMany({
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        tokens: { orderBy: { tokenNumber: 'asc' } },
        prescriptions: true,
        labRequests: { include: { report: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get single Encounter with timeline
   */
  async getEncounterById(id: string) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        tokens: { orderBy: { tokenNumber: 'asc' } },
        prescriptions: true,
        labRequests: { include: { report: true } },
      },
    });
    if (!enc) throw new NotFoundException('Encounter not found');
    return enc;
  }

  /**
   * Overview Stats across all 5 levels
   */
  async getOverviewStats() {
    const levels = ['LV1_PATIENT', 'LV2_DOCTOR', 'LV3_PHARMACY', 'LV4_LAB_TEST', 'LV5_LAB_REPORT'];
    const stats: Record<string, any> = {};

    for (const lvl of levels) {
      const waiting = await this.prisma.multiLevelToken.count({ where: { level: lvl, status: 'WAITING' } });
      const active = await this.prisma.multiLevelToken.count({ where: { level: lvl, status: { in: ['CALLED', 'IN_PROGRESS'] } } });
      const completed = await this.prisma.multiLevelToken.count({ where: { level: lvl, status: 'COMPLETED' } });
      stats[lvl] = { waiting, active, completed, total: waiting + active + completed };
    }

    const totalEncounters = await this.prisma.encounter.count();
    const activeEncounters = await this.prisma.encounter.count({ where: { status: 'ACTIVE' } });

    return {
      levels: stats,
      totalEncounters,
      activeEncounters,
    };
  }

  private broadcastUpdate() {
    try {
      this.realtime.broadcast('MULTI_QUEUE_UPDATED', {
        timestamp: new Date().toISOString(),
      });
    } catch {}
  }
}
