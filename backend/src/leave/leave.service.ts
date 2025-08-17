import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
  ) {}

  async create(createLeaveDto: CreateLeaveDto) {
    const leave = this.leaveRepository.create(createLeaveDto);
    return this.leaveRepository.save(leave);
  }

  findAll() {
    return this.leaveRepository.find();
  }

  async findOne(id: number) {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }
    return leave;
  }

  async updateStatus(id: number, status: 'Pending' | 'Approved' | 'Rejected') {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }
    leave.status = status;
    return this.leaveRepository.save(leave);
  }

  async remove(id: number) {
    const leave = await this.findOne(id);
    await this.leaveRepository.remove(leave);
  }
}
