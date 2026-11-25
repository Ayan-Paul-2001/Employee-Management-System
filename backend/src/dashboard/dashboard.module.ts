import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { NoticesModule } from '../notices/notices.module';

@Module({
  imports: [UsersModule, AttendanceModule, LeaveModule, NoticesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
