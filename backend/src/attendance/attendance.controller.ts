import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service.js';
import { CheckInDto, CheckOutDto, MarkAttendanceDto } from './dto/attendance.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApprovedUserGuard } from '../common/guards/approved-user.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, ApprovedUserGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Check in for today (Employee & Admin only — Office Hours 9:00 AM - 5:00 PM)' })
  checkIn(@Request() req, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Post('check-out')
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Check out for today (Employee & Admin only — Office Hours 9:00 AM - 5:00 PM)' })
  checkOut(@Request() req, @Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(req.user.id, dto);
  }

  @Get('today')
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Get authenticated Employee/Admin attendance status for today' })
  getToday(@Request() req) {
    return this.attendanceService.getTodayStatus(req.user.id);
  }

  @Get('me')
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Get authenticated Employee/Admin attendance history' })
  findMine(@Request() req) {
    return this.attendanceService.findMyAttendance(req.user.id);
  }

  @Get('analytics')
  @Roles(Role.HR)
  @ApiOperation({ summary: 'HR Attendance Pie Chart analytics (Present vs Absent)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiQuery({ name: 'date', required: false, type: String })
  getHrAnalytics(
    @Query('period') period = 'today',
    @Query('date') date?: string,
  ) {
    return this.attendanceService.getHrAnalytics(period, date);
  }

  @Get()
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all staff attendance records (HR & Admin)' })
  findAll(
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('role') role?: string,
  ) {
    return this.attendanceService.findAll({ date, startDate, endDate, role });
  }

  @Post('manual')
  @Roles(Role.HR)
  @ApiOperation({ summary: 'Manually mark or update attendance (HR only)' })
  markManual(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markManual(dto);
  }
}
