import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { UsersModule } from '../users/users.module.js';
import { AttendanceModule } from '../attendance/attendance.module.js';
import { LeaveModule } from '../leave/leave.module.js';
import { NoticesModule } from '../notices/notices.module.js';

@Module({
  imports: [UsersModule, AttendanceModule, LeaveModule, NoticesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
