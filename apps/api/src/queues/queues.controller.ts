import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@hospital-nav/shared-types';

@Controller('queues')
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get('department/:id')
  getDepartmentQueues(@Param('id') id: string) {
    return this.queuesService.getDepartmentQueues(id);
  }

  @Get('doctor/:id')
  getDoctorQueue(@Param('id') id: string) {
    return this.queuesService.getDoctorQueue(id);
  }

  @Post(':doctorId/join')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  joinQueue(@Param('doctorId') doctorId: string, @Request() req: any) {
    // In a real app, we'd look up the patientId from req.user.id
    // For demo/simplicity, assuming patient ID is provided or mockable
    // Assuming req.user contains the user record
    return this.queuesService.joinQueue(doctorId, req.user.id); // Or mock patient ID
  }

  @Post(':doctorId/next')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  callNext(@Param('doctorId') doctorId: string) {
    return this.queuesService.callNext(doctorId);
  }

  @Post(':doctorId/complete/:entryId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  completePatient(
    @Param('doctorId') doctorId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.queuesService.completePatient(doctorId, entryId);
  }

  @Get(':doctorId/position')
  getPosition(@Param('doctorId') doctorId: string, @Request() req: any) {
    const patientId = req.user?.patientId || req.user?.id;
    return this.queuesService.getPatientPosition(doctorId, patientId);
  }
}
