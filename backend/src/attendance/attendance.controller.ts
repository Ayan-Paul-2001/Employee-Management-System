import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/role/role.decorator';
import { UserRole } from 'src/auth/role/role';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

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

  // Employee can create attendance
  @Post()
  @Role(UserRole.EMPLOYEE)
  async createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    try {
      // Ensure dates are properly parsed
      if (typeof createAttendanceDto.checkIn === 'string') {
        createAttendanceDto.checkIn = new Date(createAttendanceDto.checkIn);
      }
      
      // Handle checkOut date - carefully handle null/undefined cases
      if (createAttendanceDto.checkOut) {
        try {
          createAttendanceDto.checkOut = new Date(createAttendanceDto.checkOut);
          // Validate if it's a valid date
          if (isNaN(createAttendanceDto.checkOut.getTime())) {
            throw new BadRequestException('checkOut must be a valid date');
          }
        } catch (error) {
          throw new BadRequestException('checkOut must be a valid date format');
        }
      }
      
      // Validate that the employee exists before creating attendance
      const employeeId = createAttendanceDto.employeeId;
      if (!employeeId) {
        throw new BadRequestException('Employee ID is required');
      }
      
      return await this.attendanceService.create(createAttendanceDto);
    } catch (error) {
      throw new BadRequestException(`Failed to create attendance: ${error.message}`);
    }
  }

  // Employee can view their own attendance
  @Get('my-attendance/:employeeId')
  @Role(UserRole.EMPLOYEE)
  getMyAttendance(@Param('employeeId') id: string) {
    return this.attendanceService.getSummary(Number(id));
  }
}
