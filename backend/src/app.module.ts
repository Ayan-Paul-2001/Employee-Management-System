import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin/entities/admin.entity';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EmployeeModule } from './employee/employee.module';
import { Employee } from './employee/entities/employee.entity';
import { LeaveModule } from './leave/leave.module';
import { Leave } from './leave/entities/leave.entity';
import { User } from './auth/entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/entities/attendance.entity';
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/entities/notice.entity';
import { ReportModule } from './report/report.module';
import { HrModule } from './hr/hr.module';
import { Employee as HrEmployee } from './hr/entities/employee.entity';
import { LeaveRequest } from './hr/entities/leave-request.entity';
import { PerformanceReview } from './hr/entities/performance-review.entity';
import { Announcement } from './hr/entities/announcement.entity';


@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'apCSE',
      database: 'employeemanagementsystem',
      entities: [User,Admin, Employee, Leave,Attendance,Notice, HrEmployee, LeaveRequest, PerformanceReview, Announcement],
      synchronize: true,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    AuthModule,
    AdminModule,
    EmployeeModule,
    LeaveModule,
    AttendanceModule,
    NoticeModule,
    ReportModule,
    HrModule,
  ],
})
export class AppModule {}
