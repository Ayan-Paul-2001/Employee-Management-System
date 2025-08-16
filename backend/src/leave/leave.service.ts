import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from './entities/leave.entity';
;

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private leaveRepo: Repository<Leave>,
  ) {}

  async findAll(): Promise<Leave[]> {
    return this.leaveRepo.find();
  }

  async findOne(id: number): Promise<Leave> {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async updateStatus(id: number, status: 'Pending' | 'Approved' | 'Rejected'): Promise<Leave> {
    const leave = await this.findOne(id);
    leave.status = status;
    return this.leaveRepo.save(leave);
  }

  async remove(id: number): Promise<void> {
    const leave = await this.findOne(id);
    await this.leaveRepo.remove(leave);
  }
}
