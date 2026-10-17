import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MultiQueueService } from './multi-queue.service';
import { 
  RegisterPatientTokenDto, 
  DoctorConsultationDto, 
  UpdateTokenStatusDto,
  DispensePrescriptionDto,
  VerifyLabReportDto
} from './dto/multi-queue.dto';

@Controller('multi-queue')
export class MultiQueueController {
  constructor(private readonly multiQueueService: MultiQueueService) {}

  @Post('register')
  registerPatient(@Body() dto: RegisterPatientTokenDto) {
    return this.multiQueueService.registerPatient(dto);
  }

  @Get('encounters')
  getEncounters() {
    return this.multiQueueService.getEncounters();
  }

  @Get('encounter/:id')
  getEncounterById(@Param('id') id: string) {
    return this.multiQueueService.getEncounterById(id);
  }

  @Get('track/:tokenCode')
  trackToken(@Param('tokenCode') tokenCode: string) {
    return this.multiQueueService.trackToken(tokenCode);
  }

  @Get('stage/:stage')
  getStageQueue(@Param('stage') stage: string) {
    return this.multiQueueService.getStageQueue(stage);
  }

  @Get('stats')
  getOverviewStats() {
    return this.multiQueueService.getOverviewStats();
  }

  @Get('overview')
  getOverviewAlias() {
    return this.multiQueueService.getOverviewStats();
  }

  @Post('token/:tokenId/status')
  updateTokenStatus(
    @Param('tokenId') tokenId: string,
    @Body() dto: UpdateTokenStatusDto,
  ) {
    return this.multiQueueService.updateTokenStatus(tokenId, dto);
  }

  @Post('consultation/:encounterId')
  processDoctorConsultation(
    @Param('encounterId') encounterId: string,
    @Body() dto: DoctorConsultationDto,
  ) {
    return this.multiQueueService.processDoctorConsultation(encounterId, dto);
  }

  @Post('pharmacy/dispense/:prescriptionId')
  dispensePharmacy(
    @Param('prescriptionId') prescriptionId: string,
    @Body() dto: DispensePrescriptionDto,
  ) {
    return this.multiQueueService.dispensePharmacy(prescriptionId, dto.instructions);
  }

  @Post('lab/collect-sample/:requestId')
  collectLabSample(@Param('requestId') requestId: string) {
    return this.multiQueueService.collectLabSample(requestId);
  }

  @Post('lab/complete-test/:requestId')
  completeLabTest(@Param('requestId') requestId: string) {
    return this.multiQueueService.completeLabTest(requestId);
  }

  @Post('lab/verify-report/:reportId')
  verifyLabReport(
    @Param('reportId') reportId: string,
    @Body() dto: VerifyLabReportDto,
  ) {
    return this.multiQueueService.verifyLabReport(reportId, dto);
  }
}
