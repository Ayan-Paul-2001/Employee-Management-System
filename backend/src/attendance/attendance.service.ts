import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    // First, check if the employee exists
    const employeeExists = await this.employeeRepo.findOne({ 
      where: { id: createAttendanceDto.employeeId } 
    });
    
    if (!employeeExists) {
      throw new BadRequestException(`Employee with ID ${createAttendanceDto.employeeId} does not exist`);
    }
    
    // Ensure dates are properly handled
    let checkIn;
    try {
      checkIn = createAttendanceDto.checkIn instanceof Date ? 
        createAttendanceDto.checkIn : new Date(createAttendanceDto.checkIn);
      
      // Validate if it's a valid date
      if (isNaN(checkIn.getTime())) {
        throw new BadRequestException('checkIn must be a valid date');
      }
    } catch (error) {
      throw new BadRequestException('checkIn must be a valid date format');
    }
    
    // Handle checkOut - might be undefined/null for clock-in only
    let checkOut: Date | null = null;
    if (createAttendanceDto.checkOut) {
      try {
        checkOut = createAttendanceDto.checkOut instanceof Date ? 
          createAttendanceDto.checkOut : new Date(createAttendanceDto.checkOut);
        
        // Validate if it's a valid date
        if (isNaN(checkOut.getTime())) {
          throw new BadRequestException('checkOut must be a valid date');
        }
      } catch (error) {
        throw new BadRequestException('checkOut must be a valid date format');
      }
    }
    
    // Create attendance entity from DTO
    const attendance = this.attendanceRepo.create({
      ...createAttendanceDto,
      checkIn,
      // Only include checkOut if it's not null
      ...(checkOut ? { checkOut } : {}),
      // Set default values if not provided
      isLate: createAttendanceDto.isLate !== undefined ? createAttendanceDto.isLate : false,
      isAbsent: createAttendanceDto.isAbsent !== undefined ? createAttendanceDto.isAbsent : false
    });
    
    return this.attendanceRepo.save(attendance);
  }

  async getAllAttendance() {
    return this.attendanceRepo.find({ order: { date: 'DESC' } });
  }

  async getSummary(employeeId: number) {
    return this.attendanceRepo.find({
      where: { employeeId },
      order: { date: 'DESC' }
    });
  }
}
