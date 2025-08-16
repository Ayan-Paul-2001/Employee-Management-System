import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async getAllAttendance() {
    return this.attendanceRepo.find({
      order: { date: 'DESC' },
    });
  }

  async getSummary(employeeId: number) {
    return this.attendanceRepo.find({
      where: { employeeId },
      order: { date: 'DESC' },
    });
  }
}
