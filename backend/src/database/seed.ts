import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema';
import { LeaveRequest, LeaveRequestDocument } from '../leave/schemas/leave-request.schema';
import { Notice, NoticeDocument } from '../notices/schemas/notice.schema';
import { Role } from '../common/enums/role.enum';
import { AttendanceStatus } from '../common/enums/attendance-status.enum';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { LeaveType } from '../common/enums/leave-type.enum';
import { NoticeCategory, NoticePriority } from '../common/enums/notice.enum';

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const attendanceModel = app.get<Model<AttendanceDocument>>(
    getModelToken(Attendance.name),
  );
  const leaveModel = app.get<Model<LeaveRequestDocument>>(
    getModelToken(LeaveRequest.name),
  );
  const noticeModel = app.get<Model<NoticeDocument>>(getModelToken(Notice.name));

  try {
    console.log('Seeding Next Hunt Management System MongoDB Atlas...');

    const hrUser = await usersService.ensureDefaultHrUser();

    const adminUser = await usersService.createSeedUser({
      fullName: 'Daniel Brooks',
      email: 'admin@nexthunt.com',
      password: 'NextHunt@123',
      role: Role.ADMIN,
      department: 'Operations',
      position: 'Operations Admin',
      phoneNumber: '+1 (555) 201-4400',
    });

    const emp1 = await usersService.createSeedUser({
      fullName: 'Sarah Jenkins',
      email: 'sarah@nexthunt.com',
      password: 'NextHunt@123',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      position: 'Senior Frontend Engineer',
      phoneNumber: '+1 (555) 201-4411',
    });

    const emp2 = await usersService.createSeedUser({
      fullName: 'Marcus Chen',
      email: 'marcus@nexthunt.com',
      password: 'NextHunt@123',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      position: 'Backend Engineer',
      phoneNumber: '+1 (555) 201-4422',
    });

    const emp3 = await usersService.createSeedUser({
      fullName: 'Priya Nair',
      email: 'priya@nexthunt.com',
      password: 'NextHunt@123',
      role: Role.EMPLOYEE,
      department: 'Product Design',
      position: 'Lead Product Designer',
      phoneNumber: '+1 (555) 201-4433',
    });

    const emp4 = await usersService.createSeedUser({
      fullName: 'Liam O’Connor',
      email: 'liam@nexthunt.com',
      password: 'NextHunt@123',
      role: Role.EMPLOYEE,
      department: 'Growth & Marketing',
      position: 'Performance Specialist',
      phoneNumber: '+1 (555) 201-4444',
    });

    // Seed sample today attendance (Office Hours: 9:00 AM - 5:00 PM)
    const today = new Date();
    const todayStr = formatDate(today);
    const nineAM = new Date(today);
    nineAM.setHours(9, 2, 0, 0);
    const nineTen = new Date(today);
    nineTen.setHours(9, 10, 0, 0);
    const nineThirtyFive = new Date(today);
    nineThirtyFive.setHours(9, 35, 0, 0);

    const presentMembers = [
      { user: adminUser, time: nineAM, status: AttendanceStatus.PRESENT, notes: 'In HQ Office' },
      { user: emp1, time: nineAM, status: AttendanceStatus.PRESENT, notes: 'Remote' },
      { user: emp2, time: nineTen, status: AttendanceStatus.PRESENT, notes: 'In HQ Office' },
      { user: emp3, time: nineThirtyFive, status: AttendanceStatus.LATE, notes: 'Traffic delay' },
    ];

    for (const item of presentMembers) {
      await attendanceModel.updateOne(
        { userId: item.user._id, date: todayStr },
        {
          $setOnInsert: {
            userId: item.user._id,
            date: todayStr,
            checkInTime: item.time,
            status: item.status,
            notes: item.notes,
          },
        },
        { upsert: true },
      );
    }

    // Seed sample leave requests if none exist
    const leaveCount = await leaveModel.countDocuments();
    if (leaveCount === 0) {
      const nextWeekStart = new Date();
      nextWeekStart.setDate(today.getDate() + 5);
      const nextWeekEnd = new Date();
      nextWeekEnd.setDate(today.getDate() + 7);

      await leaveModel.create([
        {
          userId: emp4._id,
          leaveType: LeaveType.SICK,
          fromDate: today,
          toDate: today,
          days: 1,
          reason: 'Recovering from seasonal flu; doctor advised rest today.',
          status: LeaveStatus.PENDING,
        },
        {
          userId: emp1._id,
          leaveType: LeaveType.ANNUAL,
          fromDate: nextWeekStart,
          toDate: nextWeekEnd,
          days: 3,
          reason: 'Planned family vacation out of town.',
          status: LeaveStatus.PENDING,
        },
        {
          userId: emp2._id,
          leaveType: LeaveType.CASUAL,
          fromDate: new Date(today.getTime() - 4 * 86400000),
          toDate: new Date(today.getTime() - 3 * 86400000),
          days: 2,
          reason: 'Personal errands and home maintenance.',
          status: LeaveStatus.APPROVED,
          reviewedBy: hrUser._id,
          reviewedAt: new Date(today.getTime() - 5 * 86400000),
          reviewNote: 'Approved. Enjoy your time off.',
        },
      ]);
    }

    // Seed sample company notices if none exist
    const noticeCount = await noticeModel.countDocuments();
    if (noticeCount === 0) {
      await noticeModel.create([
        {
          title: 'Welcome to Next Hunt Management System v2.0',
          content:
            'We have officially launched our upgraded Next Hunt Management System. All Employees and Admins are kindly requested to record daily attendance via Check-In/Check-Out, submit leave applications online, and keep profile contact details up to date.',
          priority: NoticePriority.IMPORTANT,
          category: NoticeCategory.HR,
          pinned: true,
          createdBy: hrUser._id,
        },
        {
          title: 'Quarterly Performance & Goal Alignment Townhall',
          content:
            'Join our all-hands leadership session this Friday at 3:00 PM in the Main Auditorium (or via the company livestream). We will review Q4 milestones, recognize top performers, and unveil our upcoming roadmap.',
          priority: NoticePriority.NORMAL,
          category: NoticeCategory.EVENT,
          pinned: false,
          createdBy: adminUser._id,
        },
      ]);
    }

    console.log('Seed complete! Seeded HR, Admin, Employees, Attendance, Leaves & Notices.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed();
