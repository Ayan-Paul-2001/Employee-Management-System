import { Injectable } from '@nestjs/common';
import { AttendanceService } from '../attendance/attendance.service';
import { LeaveService } from '../leave/leave.service';
import { NoticesService } from '../notices/notices.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
    private readonly noticesService: NoticesService,
  ) {}

  async getOverview(
    user: { id: string; role: Role },
    period = 'today',
    date?: string,
  ) {
    if (user.role === Role.HR) {
      const [stats, analytics, leaves, notices] = await Promise.all([
        this.usersService.getStats(),
        this.attendanceService.getHrAnalytics(period, date),
        this.leaveService.findAll(),
        this.noticesService.findAll(),
      ]);

      return {
        role: user.role,
        stats,
        analytics,
        leaves,
        notices,
      };
    }

    if (user.role === Role.ADMIN) {
      const [stats, myAttendance, leaves, notices] = await Promise.all([
        this.usersService.getStats(),
        this.attendanceService.findMyAttendance(user.id),
        this.leaveService.findAll(),
        this.noticesService.findAll(),
      ]);

      return {
        role: user.role,
        stats,
        myAttendance,
        leaves,
        notices,
      };
    }

    // Employee role
    const [myAttendance, leaves, notices] = await Promise.all([
      this.attendanceService.findMyAttendance(user.id),
      this.leaveService.findMine(user.id),
      this.noticesService.findAll(),
    ]);

    return {
      role: user.role,
      myAttendance,
      leaves,
      notices,
    };
  }
}
