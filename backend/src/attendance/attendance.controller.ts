import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/role/role.decorator';
import { UserRole } from 'src/auth/role/role';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Admin can view all attendance
  @Get()
  @Role(UserRole.ADMIN)
  getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  // Admin can view one employee's summary
  @Get('employee/:employeeId')
  @Role(UserRole.ADMIN)
  getAttendanceByEmployee(@Param('employeeId') id: string) {
    return this.attendanceService.getSummary(Number(id));
  }
}
