import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepo: Repository<Notice>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createNotice(dto: CreateNoticeDto, adminId: number) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const notice = this.noticeRepo.create({
      admin,
      adminId: admin.id,
      adminName: admin.name,
      type: dto.type,
      message: dto.message,
    });

    return this.noticeRepo.save(notice);
  }

  async getAll() {
    return this.noticeRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getByAdmin(adminId: number) {
    return this.noticeRepo.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateNotice(id: number, adminId: number, dto: UpdateNoticeDto) {
    const notice = await this.noticeRepo.findOneBy({ id });
    if (!notice) throw new NotFoundException('Notice not found');
    if (notice.adminId !== adminId) throw new ForbiddenException('Access denied');

    Object.assign(notice, dto);
    return this.noticeRepo.save(notice);
  }

  async deleteNotice(id: number, adminId: number) {
    const notice = await this.noticeRepo.findOneBy({ id });
    if (!notice) throw new NotFoundException('Notice not found');
    if (notice.adminId !== adminId) throw new ForbiddenException('Access denied');

    return this.noticeRepo.remove(notice);
  }
}
