import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { EmployeeModule } from './employee/employee.module';
import { ControllerService } from './controller/controller.service';
import { HrModule } from './hr/hr.module';
import { LeaveModule } from './leave/leave.module';
import { NoticeModule } from './notice/notice.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AdminModule, AttendanceModule, EmployeeModule, HrModule, LeaveModule, NoticeModule, ReportModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, ControllerService],
})
export class AppModule {}
