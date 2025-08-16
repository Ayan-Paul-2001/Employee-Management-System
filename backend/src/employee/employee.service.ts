import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { LeaveService } from '../leave/leave.service';
import { AttendanceService } from '../attendance/attendance.service';
import { CreateLeaveDto } from '../leave/dto/create-leave.dto';
import { CreateAttendanceDto } from '../attendance/dto/create-attendance.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private readonly leaveService: LeaveService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepo.create(dto);
    return this.employeeRepo.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepo.find();
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, dto);
    return this.employeeRepo.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepo.remove(employee);
  }

  async requestLeave(userId: number, createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
}

async recordAttendance(userId: number, createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
}
}
