import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ApproveAttendanceDto } from './dto/approve-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create attendance record (Admin/HR only)' })
  @ApiResponse({ status: 201, description: 'Attendance record created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance records by employee ID' })
  findByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findByEmployeeId(+employeeId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get attendance records by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  findOne(@Param('id') id: string) {
    const attendanceId = parseInt(id);
    if (isNaN(attendanceId)) {
      throw new BadRequestException(`Invalid attendance ID: ${id}`);
    }
    return this.attendanceService.findOne(attendanceId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update attendance record (Admin/HR only)' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    const attendanceId = parseInt(id);
    if (isNaN(attendanceId)) {
      throw new BadRequestException(`Invalid attendance ID: ${id}`);
    }
    return this.attendanceService.update(attendanceId, updateAttendanceDto);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Check in for attendance' })
  @ApiResponse({ status: 201, description: 'Check-in successful' })
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(checkInDto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out for attendance' })
  @ApiResponse({ status: 200, description: 'Check-out successful' })
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.attendanceService.checkOut(checkOutDto);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Approve or reject attendance record (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Attendance record approved/rejected successfully' })
  approveAttendance(
    @Param('id') id: string,
    @Body() approveAttendanceDto: ApproveAttendanceDto,
  ) {
    const attendanceId = parseInt(id);
    if (isNaN(attendanceId)) {
      throw new BadRequestException(`Invalid attendance ID: ${id}`);
    }
    return this.attendanceService.approveAttendance(attendanceId, approveAttendanceDto);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get all pending attendance records (Admin/HR only)' })
  findPendingAttendances() {
    return this.attendanceService.findPendingAttendances();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete attendance record (Admin/HR only)' })
  remove(@Param('id') id: string) {
    const attendanceId = parseInt(id);
    if (isNaN(attendanceId)) {
      throw new BadRequestException(`Invalid attendance ID: ${id}`);
    }
    return this.attendanceService.remove(attendanceId);
  }
}