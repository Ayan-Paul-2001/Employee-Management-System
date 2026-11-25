import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notice, NoticeDocument } from './schemas/notice.schema';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { NoticeCategory, NoticePriority } from '../common/enums/notice.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { Role } from '../common/enums/role.enum';
import { CacheService } from '../common/cache.service';

@Injectable()
export class NoticesService {
  constructor(
    @InjectModel(Notice.name)
    private readonly noticeModel: Model<NoticeDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly cacheService: CacheService,
  ) {}

  private formatNotice(doc: any) {
    const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    if (json._id && !json.id) {
      json.id = json._id.toString();
      delete json._id;
      delete json.__v;
    }
    const rawAuthor = json.createdBy;
    const author =
      typeof rawAuthor === 'object' && rawAuthor
        ? {
            ...rawAuthor,
            id: rawAuthor.id || rawAuthor._id?.toString(),
          }
        : null;
    if (author && '_id' in author) delete author._id;
    return {
      ...json,
      author,
    };
  }

  async create(dto: CreateNoticeDto, authorId: string) {
    const created = await this.noticeModel.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
      priority: dto.priority || NoticePriority.NORMAL,
      category: dto.category || NoticeCategory.GENERAL,
      pinned: Boolean(dto.pinned),
      createdBy: new Types.ObjectId(authorId),
    });

    await this.notificationsService.createForRoles(
      [Role.EMPLOYEE, Role.ADMIN, Role.HR],
      {
        type: NotificationType.NOTICE_POSTED,
        title: `New Notice: ${created.title}`,
        message:
          created.content.length > 110
            ? `${created.content.slice(0, 110)}...`
            : created.content,
        metadata: { noticeId: created._id.toString(), priority: created.priority },
      },
      authorId,
    );

    const populated = await this.noticeModel
      .findById(created._id)
      .populate('createdBy', 'fullName email role employeeCode')
      .exec();

    this.cacheService.invalidatePrefix('notices:');
    return this.formatNotice(populated);
  }

  async findAll() {
    return this.cacheService.getOrSet('notices:all', async () => {
      const notices = await this.noticeModel
        .find()
        .populate('createdBy', 'fullName email role employeeCode')
        .sort({ pinned: -1, createdAt: -1 })
        .lean()
        .exec();
      return notices.map((n) => this.formatNotice(n));
    });
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notice ID');
    }
    const notice = await this.noticeModel
      .findById(id)
      .populate('createdBy', 'fullName email role employeeCode')
      .exec();
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    return this.formatNotice(notice);
  }

  async update(id: string, dto: UpdateNoticeDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notice ID');
    }
    const updated = await this.noticeModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
            ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
            ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
            ...(dto.category !== undefined ? { category: dto.category } : {}),
            ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {}),
          },
        },
        { new: true },
      )
      .populate('createdBy', 'fullName email role employeeCode')
      .exec();

    if (!updated) {
      throw new NotFoundException('Notice not found');
    }
    this.cacheService.invalidatePrefix('notices:');
    return this.formatNotice(updated);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notice ID');
    }
    const res = await this.noticeModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('Notice not found');
    }
    this.cacheService.invalidatePrefix('notices:');
    return { success: true };
  }
}
