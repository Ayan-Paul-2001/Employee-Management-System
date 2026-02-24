import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { EmployeesService } from '../employees/employees.service';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { PusherService } from '../common/services/pusher.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    private employeesService: EmployeesService,
    private pusherService: PusherService,
  ) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    // Check if employee exists
    await this.employeesService.findOne(createLeaveRequestDto.employeeId);

    // Validate dates
    const fromDate = new Date(createLeaveRequestDto.fromDate);
    const toDate = new Date(createLeaveRequestDto.toDate);

    if (fromDate > toDate) {
      throw new BadRequestException('From date cannot be after to date');
    }

    // Check for overlapping leave requests
    const overlappingLeaves = await this.leaveRequestRepository.find({
      where: [
        {
          employeeId: createLeaveRequestDto.employeeId,
          fromDate: Between(new Date(createLeaveRequestDto.fromDate), new Date(createLeaveRequestDto.toDate)),
          status: LeaveStatus.APPROVED,
        },
        {
          employeeId: createLeaveRequestDto.employeeId,
          toDate: Between(new Date(createLeaveRequestDto.fromDate), new Date(createLeaveRequestDto.toDate)),
          status: LeaveStatus.APPROVED,
        },
      ],
    });

    if (overlappingLeaves.length > 0) {
      throw new BadRequestException('Employee already has approved leave during this period');
    }

    // Create and save the leave request
    const newLeaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      status: LeaveStatus.PENDING,
    });

    const savedLeaveRequest = await this.leaveRequestRepository.save(newLeaveRequest);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyLeaveUpdate(
      savedLeaveRequest.id,
      savedLeaveRequest.employeeId,
      LeaveStatus.PENDING
    );
    
    return savedLeaveRequest;
  }

  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      relations: ['employee', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployeeId(employeeId: string): Promise<LeaveRequest[]> {
    try {
      // Check if employee exists
      const employee = await this.employeesService.findByEmployeeId(employeeId);
      
      return this.leaveRequestRepository.find({
        where: { employeeId: employee.id },
        relations: ['approver'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      // If finding by employeeId string fails, try finding by direct ID conversion
      try {
        const numericId = parseInt(employeeId, 10);
        if (!isNaN(numericId)) {
          return this.leaveRequestRepository.find({
            where: { employeeId: numericId },
            relations: ['approver'],
            order: { createdAt: 'DESC' },
          });
        }
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      } catch (innerError) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
    }
  }

  async findPendingRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { status: LeaveStatus.PENDING },
      relations: ['employee'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee', 'approver'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  async update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto, approverId: number): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    // Update leave request status and approver
    Object.assign(leaveRequest, {
      ...updateLeaveRequestDto,
      approverId,
      updatedAt: new Date(),
    });

    const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyLeaveUpdate(
      updatedLeaveRequest.id,
      updatedLeaveRequest.employeeId,
      updatedLeaveRequest.status
    );
    
    return updatedLeaveRequest;
  }

  async remove(id: number): Promise<void> {
    const leaveRequest = await this.findOne(id);
    await this.leaveRequestRepository.remove(leaveRequest);
  }
}