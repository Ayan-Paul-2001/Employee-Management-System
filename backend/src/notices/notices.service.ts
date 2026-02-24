import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { UsersService } from '../users/users.service';
import { PusherService } from '../common/services/pusher.service';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
    private usersService: UsersService,
    private pusherService: PusherService,
  ) {}

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    // Check if user exists
    await this.usersService.findOne(createNoticeDto.createdById);

    // Create and save the notice
    const newNotice = this.noticeRepository.create(createNoticeDto);
    const savedNotice = await this.noticeRepository.save(newNotice);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyNewNotice(
      savedNotice.id,
      savedNotice.title
    );
    
    return savedNotice;
  }

  async findAll(): Promise<Notice[]> {
    return this.noticeRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!notice) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }

    return notice;
  }

  async update(id: number, updateNoticeDto: UpdateNoticeDto): Promise<Notice> {
    const notice = await this.findOne(id);

    // Update notice properties
    Object.assign(notice, updateNoticeDto);

    const updatedNotice = await this.noticeRepository.save(notice);
    
    // Send real-time notification via Pusher
    await this.pusherService.notifyNewNotice(
      updatedNotice.id,
      updatedNotice.title
    );
    
    return updatedNotice;
  }

  async remove(id: number): Promise<void> {
    const notice = await this.findOne(id);
    await this.noticeRepository.remove(notice);
  }
}