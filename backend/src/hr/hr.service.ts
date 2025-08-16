import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../auth/role/role';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';
import { LeaveApprovalDto } from './dto/leave-approval.dto';
import { PerformanceReview } from './entities/performance-review.entity';
import { Announcement } from './entities/announcement.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(PerformanceReview)
    private readonly reviewRepository: Repository<PerformanceReview>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async onboardEmployee(dto: CreateEmployeeDto): Promise<{ user: User; employee: Employee }> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    });
    const savedUser = await this.userRepository.save(user);
    const employee = this.employeeRepository.create({
      user: savedUser,
      department: dto.department,
      designation: dto.designation,
      joining_date: dto.joining_date,
    });
    const savedEmployee = await this.employeeRepository.save(employee);
    return { user: savedUser, employee: savedEmployee };
  }
  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find({ relations: ['user'] });
  }
  async updateEmployee(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    if (dto.department) employee.department = dto.department;
    if (dto.designation) employee.designation = dto.designation;
    return this.employeeRepository.save(employee);
  }
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ relations: ['employee', 'employee.user'] });
  }
  async approveOrRejectLeave(id: number, dto: LeaveApprovalDto): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findOne({ where: { id } });
    if (!leave) throw new HttpException('Leave request not found', HttpStatus.NOT_FOUND);
    if (![LeaveStatus.APPROVED, LeaveStatus.REJECTED].includes(dto.status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }
    leave.status = dto.status;
    return this.leaveRequestRepository.save(leave);
  }
  async addPerformanceReview(dto: CreateReviewDto): Promise<PerformanceReview> {
    const employee = await this.employeeRepository.findOne({ where: { id: dto.employeeId } });
    if (!employee) throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    const review = this.reviewRepository.create({
      employee,
      review_text: dto.review_text,
      rating: dto.rating,
      review_date: dto.review_date,
    });
    return this.reviewRepository.save(review);
  }
  async getEmployeeReviews(employeeId: number): Promise<PerformanceReview[]> {
    return this.reviewRepository.find({
      where: { employee: { id: employeeId } },
      relations: ['employee', 'employee.user'],
    });
  }
  async postAnnouncement(dto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      title: dto.title,
      message: dto.message,
    });
    return this.announcementRepository.save(announcement);
  }
  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.find({ order: { created_at: 'DESC' } });
  }
} 