import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './schemas/leave-request.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { CreateLeaveRequestDto, ReviewLeaveDto } from './dto/leave.dto.js';
import { LeaveStatus } from '../common/enums/leave-status.enum.js';
import { LeaveType } from '../common/enums/leave-type.enum.js';
import { Role } from '../common/enums/role.enum.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../notifications/schemas/notification.schema.js';
import { MailService } from '../mail/mail.service.js';
import { CacheService } from '../common/cache.service.js';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private readonly leaveModel: Model<LeaveRequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
  ) {}

  private formatDoc(doc: any) {
    const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    if (json._id && !json.id) {
      json.id = json._id.toString();
      delete json._id;
      delete json.__v;
    }
    const normalizeRef = (ref: any) => {
      if (!ref || typeof ref !== 'object') return null;
      const out = { ...ref, id: ref.id || ref._id?.toString() };
      delete out._id;
      return out;
    };
    return {
      ...json,
      applicant: normalizeRef(json.userId),
      reviewer: normalizeRef(json.reviewedBy),
    };
  }

  async create(userId: string, dto: CreateLeaveRequestDto) {
    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }
    if (fromDate > toDate) {
      throw new BadRequestException('Start date cannot be after end date.');
    }

    const diffDays =
      Math.floor(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const userObjId = new Types.ObjectId(userId);
    const overlap = await this.leaveModel.findOne({
      userId: userObjId,
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });

    if (overlap) {
      throw new BadRequestException(
        'You already have a pending or approved leave request overlapping these dates.',
      );
    }

    const applicant = await this.userModel.findById(userObjId).exec();
    const created = await this.leaveModel.create({
      userId: userObjId,
      leaveType: dto.leaveType || LeaveType.CASUAL,
      fromDate,
      toDate,
      days: diffDays,
      reason: dto.reason.trim(),
      status: LeaveStatus.PENDING,
    });

    // Notify HR & Admins via dashboard notification
    await this.notificationsService.createForRoles(
      [Role.HR, Role.ADMIN],
      {
        type: NotificationType.LEAVE_APPLIED,
        title: 'New Leave Application',
        message: `${applicant?.fullName || 'An employee'} applied for ${diffDays} day(s) of ${created.leaveType} leave (${dto.fromDate} to ${dto.toDate}).`,
        metadata: { leaveId: created._id.toString(), userId },
      },
      userId,
    );

    const populated = await this.leaveModel
      .findById(created._id)
      .populate('userId', 'fullName email role employeeCode department position')
      .exec();

    this.cacheService.invalidatePrefix('leaves:');
    return this.formatDoc(populated);
  }

  async findMine(userId: string) {
    return this.cacheService.getOrSet(`leaves:mine:${userId}`, async () => {
      const leaves = await this.leaveModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('userId', 'fullName email role employeeCode department position')
        .populate('reviewedBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return leaves.map((l) => this.formatDoc(l));
    });
  }

  async findAll(status?: string) {
    const key = `leaves:all:${status || 'all'}`;
    return this.cacheService.getOrSet(key, async () => {
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      const leaves = await this.leaveModel
        .find(query)
        .populate('userId', 'fullName email role employeeCode department position')
        .populate('reviewedBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return leaves.map((l) => this.formatDoc(l));
    });
  }

  async review(
    id: string,
    status: LeaveStatus.APPROVED | LeaveStatus.REJECTED,
    reviewer: { id: string; fullName: string; role: Role },
    dto?: ReviewLeaveDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave request ID');
    }

    const leave = await this.leaveModel
      .findById(id)
      .populate('userId', 'fullName email role employeeCode department position')
      .exec();

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    const applicant: any = leave.userId;
    const applicantId = applicant?._id?.toString() || applicant?.toString();

    if (applicantId === reviewer.id && reviewer.role !== Role.HR) {
      throw new ForbiddenException('You cannot approve or reject your own leave application.');
    }

    leave.status = status;
    leave.reviewedBy = new Types.ObjectId(reviewer.id);
    leave.reviewedAt = new Date();
    leave.reviewNote = dto?.reviewNote?.trim() || null;
    await leave.save();

    const fromStr = new Date(leave.fromDate).toISOString().split('T')[0];
    const toStr = new Date(leave.toDate).toISOString().split('T')[0];

    await this.notificationsService.createForUser(applicantId, {
      type: NotificationType.LEAVE_REVIEWED,
      title: `Leave Request ${status === LeaveStatus.APPROVED ? 'Approved' : 'Rejected'}`,
      message: `Your leave request (${fromStr} to ${toStr}) was ${status} by ${reviewer.fullName}.${leave.reviewNote ? ` Note: ${leave.reviewNote}` : ''}`,
      metadata: { leaveId: leave._id.toString(), status },
    });

    if (applicant?.email) {
      await this.mailService.sendLeaveDecisionEmail(
        applicant.email,
        applicant.fullName || 'Team Member',
        status === LeaveStatus.APPROVED ? 'approved' : 'rejected',
        fromStr,
        toStr,
        reviewer.fullName,
        leave.reviewNote || undefined,
      );
    }

    const updated = await this.leaveModel
      .findById(leave._id)
      .populate('userId', 'fullName email role employeeCode department position')
      .populate('reviewedBy', 'fullName email role')
      .exec();

    this.cacheService.invalidatePrefix('leaves:');
    this.cacheService.invalidatePrefix('attendance:analytics:');
    return this.formatDoc(updated);
  }

  async remove(id: string, actor: { id: string; role: Role }) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave request ID');
    }
    const leave = await this.leaveModel.findById(id).exec();
    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    const isOwner = leave.userId.toString() === actor.id;
    const isManager = actor.role === Role.HR || actor.role === Role.ADMIN;

    if (!isManager && (!isOwner || leave.status !== LeaveStatus.PENDING)) {
      throw new ForbiddenException('You can only cancel your own pending leave requests.');
    }

    await this.leaveModel.deleteOne({ _id: leave._id }).exec();
    this.cacheService.invalidatePrefix('leaves:');
    this.cacheService.invalidatePrefix('attendance:analytics:');
    return { success: true };
  }
}
