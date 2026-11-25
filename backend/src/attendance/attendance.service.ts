import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from '../leave/schemas/leave-request.schema';
import { AttendanceStatus } from '../common/enums/attendance-status.enum';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { Role } from '../common/enums/role.enum';
import { ApprovalStatus } from '../common/enums/approval-status.enum';
import { CheckInDto, CheckOutDto, MarkAttendanceDto } from './dto/attendance.dto';
import { CacheService } from '../common/cache.service';

export const ATTENDANCE_POLICY = {
  portalOpenMinutes: 8 * 60 + 30, // 8:30 AM (510)
  presentCutoffMinutes: 9 * 60 + 10, // 9:10 AM (550)
  portalCloseMinutes: 17 * 60, // 5:00 PM (1020)
  officeHoursLabel: '9:00 AM – 5:00 PM',
  portalWindowLabel: '8:30 AM – 5:00 PM',
};

export function evaluateAttendanceWindow(now: Date = new Date()): {
  isOpen: boolean;
  status?: AttendanceStatus.PRESENT | AttendanceStatus.LATE;
  reason?: string;
} {
  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  if (totalMinutes < ATTENDANCE_POLICY.portalOpenMinutes) {
    return {
      isOpen: false,
      reason:
        'Attendance portal is currently closed. It opens at 8:30 AM.',
    };
  }

  if (totalMinutes > ATTENDANCE_POLICY.portalCloseMinutes) {
    return {
      isOpen: false,
      reason:
        'Attendance portal is closed after 5:00 PM. It will reopen tomorrow at 8:30 AM.',
    };
  }

  if (totalMinutes <= ATTENDANCE_POLICY.presentCutoffMinutes) {
    return { isOpen: true, status: AttendanceStatus.PRESENT };
  }

  return { isOpen: true, status: AttendanceStatus.LATE };
}

function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(period: string, customDate?: string): string[] {
  const today = customDate ? new Date(`${customDate}T00:00:00`) : new Date();
  if (isNaN(today.getTime())) {
    throw new BadRequestException('Invalid date parameter. Use YYYY-MM-DD.');
  }

  const dates: string[] = [];
  let daysCount = 1;
  if (period === 'week') daysCount = 7;
  else if (period === 'month') daysCount = 30;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatLocalDate(d));
  }
  return dates;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(LeaveRequest.name)
    private readonly leaveModel: Model<LeaveRequestDocument>,
    private readonly cacheService: CacheService,
  ) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const now = new Date();
    const windowCheck = evaluateAttendanceWindow(now);
    if (!windowCheck.isOpen || !windowCheck.status) {
      throw new BadRequestException(windowCheck.reason);
    }

    const todayStr = formatLocalDate(now);
    const userObjId = new Types.ObjectId(userId);

    const existing = await this.attendanceModel
      .findOne({ userId: userObjId, date: todayStr })
      .exec();

    if (existing && existing.checkInTime) {
      throw new ConflictException('You have already checked in today.');
    }

    // 8:30 AM – 9:10 AM => PRESENT; 9:11 AM – 5:00 PM => LATE
    const status = windowCheck.status;

    if (existing) {
      existing.checkInTime = now;
      existing.status = status;
      if (dto.notes) existing.notes = dto.notes.trim();
      await existing.save();
      this.cacheService.invalidatePrefix('attendance:');
      return existing.toJSON();
    }

    const created = await this.attendanceModel.create({
      userId: userObjId,
      date: todayStr,
      checkInTime: now,
      status,
      notes: dto.notes?.trim() || '',
    });

    this.cacheService.invalidatePrefix('attendance:');
    return created.toJSON();
  }

  async checkOut(userId: string, dto: CheckOutDto) {
    const todayStr = formatLocalDate(new Date());
    const userObjId = new Types.ObjectId(userId);

    const attendance = await this.attendanceModel
      .findOne({ userId: userObjId, date: todayStr })
      .exec();

    if (!attendance || !attendance.checkInTime) {
      throw new NotFoundException('No check-in record found for today. Please check in first.');
    }

    if (attendance.checkOutTime) {
      throw new ConflictException('You have already checked out today.');
    }

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - new Date(attendance.checkInTime).getTime());
    const workHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

    attendance.checkOutTime = now;
    attendance.workHours = workHours;
    if (dto.notes) {
      attendance.notes = attendance.notes
        ? `${attendance.notes} | ${dto.notes.trim()}`
        : dto.notes.trim();
    }

    await attendance.save();
    this.cacheService.invalidatePrefix('attendance:');
    return attendance.toJSON();
  }

  async getTodayStatus(userId: string) {
    const todayStr = formatLocalDate(new Date());
    const record = await this.attendanceModel
      .findOne({ userId: new Types.ObjectId(userId), date: todayStr })
      .lean()
      .exec();
    const formatted = record
      ? { ...record, id: (record as any)._id.toString() }
      : null;
    if (formatted) {
      delete (formatted as any)._id;
      delete (formatted as any).__v;
    }
    return {
      date: todayStr,
      record: formatted,
    };
  }

  async findMyAttendance(userId: string) {
    return this.cacheService.getOrSet(`attendance:me:${userId}`, async () => {
      const records: any[] = await this.attendanceModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ date: -1 })
        .limit(90)
        .lean()
        .exec();

      const formatted = records.map(({ _id, __v, ...rest }) => ({
        ...rest,
        id: _id.toString(),
      }));
      const todayStr = formatLocalDate(new Date());
      const todayRecord = formatted.find((r) => r.date === todayStr) || null;

      return {
        today: todayRecord,
        records: formatted,
      };
    });
  }

  async findAll(filters?: { date?: string; startDate?: string; endDate?: string; role?: string }) {
    const key = `attendance:all:${filters?.date || ''}:${filters?.startDate || ''}:${filters?.endDate || ''}:${filters?.role || 'all'}`;
    return this.cacheService.getOrSet(key, async () => {
      const query: any = {};
      if (filters?.date) {
        query.date = filters.date;
      } else if (filters?.startDate && filters?.endDate) {
        query.date = { $gte: filters.startDate, $lte: filters.endDate };
      }

      const records: any[] = await this.attendanceModel
        .find(query)
        .populate('userId', 'fullName email role employeeCode department position')
        .sort({ date: -1, checkInTime: -1 })
        .limit(300)
        .lean()
        .exec();

      let results = records
        .map(({ _id, __v, ...rest }) => {
          const rawUser = rest.userId;
          const user =
            typeof rawUser === 'object' && rawUser
              ? { ...rawUser, id: rawUser.id || rawUser._id?.toString() }
              : null;
          if (user && '_id' in user) delete user._id;
          return {
            ...rest,
            id: _id.toString(),
            user,
          };
        })
        .filter((r) => r.user?.role !== Role.HR);

      if (filters?.role && filters.role !== 'all') {
        results = results.filter((r) => r.user?.role === filters.role);
      }

      return results;
    });
  }

  async markManual(dto: MarkAttendanceDto) {
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const userObjId = new Types.ObjectId(dto.userId);
    const updated = await this.attendanceModel
      .findOneAndUpdate(
        { userId: userObjId, date: dto.date },
        {
          $set: {
            status: dto.status,
            notes: dto.notes?.trim() || '',
            ...(dto.status === AttendanceStatus.PRESENT ? { checkInTime: new Date() } : {}),
          },
        },
        { upsert: true, new: true },
      )
      .populate('userId', 'fullName email role employeeCode department position')
      .exec();
    this.cacheService.invalidatePrefix('attendance:');
    return updated.toJSON();
  }

  /**
   * HR Dashboard Analytics: Present vs Absent Pie Chart & Staff Breakdown
   * Tracks all active Employees and Admins (since Admins also record attendance).
   */
  async getHrAnalytics(period = 'today', customDate?: string) {
    const cacheKey = `attendance:analytics:${period}:${customDate || 'today'}`;
    return this.cacheService.getOrSet(cacheKey, () =>
      this.computeHrAnalytics(period, customDate),
    );
  }

  private async computeHrAnalytics(period = 'today', customDate?: string) {
    const dates = getDateRange(period, customDate);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // Fetch all active APPROVED tracked staff (Employee + Admin roles) with lean projection
    const staff: any[] = await this.userModel
      .find({
        role: { $in: [Role.EMPLOYEE, Role.ADMIN] },
        isActive: true,
        isApproved: { $ne: false },
        approvalStatus: {
          $nin: [ApprovalStatus.PENDING, ApprovalStatus.REJECTED],
        },
      })
      .select('fullName email employeeCode role department position dateOfJoining createdAt')
      .sort({ role: 1, fullName: 1 })
      .lean()
      .exec();

    const staffIds = staff.map((s) => s._id);

    const [attendanceRecords, approvedLeaves] = await Promise.all([
      this.attendanceModel
        .find({
          userId: { $in: staffIds },
          date: { $gte: startDate, $lte: endDate },
        })
        .select('userId date status checkInTime checkOutTime workHours')
        .lean()
        .exec(),
      this.leaveModel
        .find({
          userId: { $in: staffIds },
          status: LeaveStatus.APPROVED,
          fromDate: { $lte: new Date(`${endDate}T23:59:59.999Z`) },
          toDate: { $gte: new Date(`${startDate}T00:00:00.000Z`) },
        })
        .select('userId fromDate toDate')
        .lean()
        .exec(),
    ]);

    // Index attendance by userId_date
    const recordMap = new Map<string, any>();
    for (const rec of attendanceRecords) {
      recordMap.set(`${rec.userId.toString()}_${rec.date}`, rec);
    }

    const isOnApprovedLeave = (uid: string, dateStr: string): boolean => {
      const target = new Date(`${dateStr}T12:00:00Z`).getTime();
      return approvedLeaves.some((lv) => {
        if (lv.userId.toString() !== uid) return false;
        const from = new Date(lv.fromDate);
        from.setUTCHours(0, 0, 0, 0);
        const to = new Date(lv.toDate);
        to.setUTCHours(23, 59, 59, 999);
        return target >= from.getTime() && target <= to.getTime();
      });
    };

    let totalPresentCount = 0;
    let totalAbsentCount = 0;
    let totalLateCount = 0;
    let totalOnLeaveCount = 0;

    const staffBreakdown = staff.map((member) => {
      const uid = member._id.toString();
      const joinedDateStr = formatLocalDate(
        member.dateOfJoining ? new Date(member.dateOfJoining) : new Date(member.createdAt || Date.now()),
      );

      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let leaveDays = 0;

      for (const d of dates) {
        // For multi-day ranges, skip days before member joined (always evaluate for single-day 'today')
        if (dates.length > 1 && d < joinedDateStr) continue;

        const rec = recordMap.get(`${uid}_${d}`);
        if (
          rec &&
          (rec.status === AttendanceStatus.PRESENT ||
            rec.status === AttendanceStatus.LATE ||
            rec.status === AttendanceStatus.HALF_DAY)
        ) {
          presentDays++;
          if (rec.status === AttendanceStatus.LATE) lateDays++;
        } else {
          absentDays++;
          if (rec?.status === AttendanceStatus.ON_LEAVE || isOnApprovedLeave(uid, d)) {
            leaveDays++;
          }
        }
      }

      totalPresentCount += presentDays;
      totalAbsentCount += absentDays;
      totalLateCount += lateDays;
      totalOnLeaveCount += leaveDays;

      const latestRec = recordMap.get(`${uid}_${endDate}`);
      const latestStatus = latestRec
        ? latestRec.status
        : isOnApprovedLeave(uid, endDate)
          ? AttendanceStatus.ON_LEAVE
          : AttendanceStatus.ABSENT;

      return {
        id: uid,
        fullName: member.fullName,
        email: member.email,
        employeeCode: member.employeeCode,
        role: member.role,
        department: member.department,
        position: member.position,
        status: latestStatus,
        checkInTime: latestRec?.checkInTime || null,
        checkOutTime: latestRec?.checkOutTime || null,
        workHours: latestRec?.workHours || 0,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
      };
    });

    const totalUnits = totalPresentCount + totalAbsentCount;
    const presentPercentage =
      totalUnits > 0 ? Math.round((totalPresentCount / totalUnits) * 100) : 0;
    const absentPercentage = totalUnits > 0 ? 100 - presentPercentage : 0;

    return {
      period,
      startDate,
      endDate,
      dateLabel:
        startDate === endDate ? startDate : `${startDate} to ${endDate}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalStaff: staff.length,
        present: totalPresentCount,
        absent: totalAbsentCount,
        late: totalLateCount,
        onLeave: totalOnLeaveCount,
        presentPercentage,
        absentPercentage,
      },
      pieData: [
        {
          name: 'Present',
          value: totalPresentCount,
          percentage: presentPercentage,
          color: '#059669',
        },
        {
          name: 'Absent',
          value: totalAbsentCount,
          percentage: absentPercentage,
          color: '#E11D48',
        },
      ],
      staffBreakdown,
    };
  }
}
