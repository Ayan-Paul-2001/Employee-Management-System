import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, ApprovalStatus } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { EmployeesService } from '../employees/employees.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ApproveAttendanceDto } from './dto/approve-attendance.dto';
import { AttendanceStatus } from '../common/enums/attendance-status.enum';
import { PusherService } from '../common/services/pusher.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private employeesService: EmployeesService,
    private pusherService: PusherService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Check if employee exists
    await this.employeesService.findOne(createAttendanceDto.employeeId);

    // Check if attendance record already exists for this date and employee
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        date: new Date(createAttendanceDto.date),
        employeeId: createAttendanceDto.employeeId,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        `Attendance record already exists for employee ID ${createAttendanceDto.employeeId} on ${createAttendanceDto.date}`,
      );
    }

    // Create and save the attendance record
    const newAttendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      approvalStatus: ApprovalStatus.PENDING
    });
    return this.attendanceRepository.save(newAttendance);
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      relations: ['employee'],
      order: { date: 'DESC' },
    });
  }

  async findByEmployeeId(employeeId: number): Promise<Attendance[]> {
    // Check if employee exists
    await this.employeesService.findOne(employeeId);

    return this.attendanceRepository.find({
      where: { employeeId },
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['employee'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Attendance> {
    // Validate id is a valid number
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid attendance ID: ${id}`);
    }

    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);

    // Update attendance properties
    Object.assign(attendance, updateAttendanceDto);

    return this.attendanceRepository.save(attendance);
  }

  async checkIn(checkInDto: CheckInDto) {
    const { employeeId, notes } = checkInDto;
    
    // Check if employee exists
    await this.employeesService.findOne(employeeId);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if attendance record already exists for today
    let attendance = await this.attendanceRepository.findOne({
      where: { employeeId, date: today },
    });
    
    // Get current time in HH:MM:SS format
    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];
    
    if (attendance) {
      // If already checked in, throw error
      if (attendance.checkInTime) {
        throw new ConflictException('Already checked in for today');
      }
      
      // Update existing record with check-in time
      // Convert string time to Date object
      const checkInDate = new Date();
      const [hours, minutes, seconds] = checkInTime.split(':').map(Number);
      checkInDate.setHours(hours, minutes, seconds || 0, 0);
      attendance.checkInTime = checkInDate;
      attendance.status = AttendanceStatus.PRESENT;
      if (notes) attendance.notes = notes;
      
      const savedAttendance = await this.attendanceRepository.save(attendance);
      
      // Send real-time notification via Pusher
      await this.pusherService.notifyAttendanceChange(
        employeeId,
        today.toISOString().split('T')[0],
        'checked-in'
      );
      
      return savedAttendance;
    } else {
      // Create new attendance record with check-in time
      // Convert string time to Date object
      const checkInDate = new Date();
      const [hours, minutes, seconds] = checkInTime.split(':').map(Number);
      checkInDate.setHours(hours, minutes, seconds || 0, 0);
      
      const newAttendance = this.attendanceRepository.create({
        employeeId,
        date: today,
        checkInTime: checkInDate,
        status: AttendanceStatus.PRESENT,
        notes,
        approvalStatus: ApprovalStatus.PENDING
      });
      
      const savedAttendance = await this.attendanceRepository.save(newAttendance);
      
      // Send real-time notification via Pusher
      await this.pusherService.notifyAttendanceChange(
        employeeId,
        today.toISOString().split('T')[0],
        'checked-in'
      );
      
      return savedAttendance;
    }
  }
  
  async checkOut(checkOutDto: CheckOutDto) {
    const { employeeId, notes } = checkOutDto;
    
    // Check if employee exists
    await this.employeesService.findOne(employeeId);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await this.attendanceRepository.findOne({
      where: { employeeId, date: today },
    });
    
    if (!attendance) {
      throw new NotFoundException('No check-in record found for today');
    }
    
    if (!attendance.checkInTime) {
      throw new BadRequestException('Cannot check out without checking in first');
    }
    
    if (attendance.checkOutTime) {
      throw new ConflictException('Already checked out for today');
    }
    
    // Get current time in HH:MM:SS format
    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];
    
    // Update record with check-out time
    // Convert string time to Date object
    const checkOutDate = new Date();
    const [hours, minutes, seconds] = checkOutTime.split(':').map(Number);
    checkOutDate.setHours(hours, minutes, seconds || 0, 0);
    attendance.checkOutTime = checkOutDate;
    if (notes) attendance.notes = `${attendance.notes || ''} ${notes}`.trim();
    
    const savedAttendance = await this.attendanceRepository.save(attendance);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyAttendanceChange(
      employeeId,
      today.toISOString().split('T')[0],
      'checked-out'
    );
    
    return savedAttendance;
  }
  
  async approveAttendance(id: number, approveAttendanceDto: ApproveAttendanceDto) {
    const attendance = await this.findOne(id);
    const { action, approvedBy, rejectionReason } = approveAttendanceDto;
    
    // Check if the approver exists (is a valid employee)
    await this.employeesService.findOne(approvedBy);
    
    if (action === 'approve') {
      attendance.approvalStatus = ApprovalStatus.APPROVED;
      attendance.approvedBy = approvedBy;
    } else if (action === 'reject') {
      if (!rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting attendance');
      }
      attendance.approvalStatus = ApprovalStatus.REJECTED;
      attendance.approvedBy = approvedBy;
      attendance.rejectionReason = rejectionReason;
    } else {
      throw new BadRequestException('Invalid action. Must be either "approve" or "reject"');
    }
    
    const savedAttendance = await this.attendanceRepository.save(attendance);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyAttendanceChange(
      attendance.employeeId,
      attendance.date.toISOString().split('T')[0],
      `attendance-${action}d`
    );
    
    return savedAttendance;
  }
  
  async findPendingAttendances() {
    return this.attendanceRepository.find({
      where: { approvalStatus: ApprovalStatus.PENDING },
      relations: ['employee'],
    });
  }
  
  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}