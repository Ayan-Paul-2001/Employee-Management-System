import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { LeaveModule } from './leave/leave.module.js';
import { NoticesModule } from './notices/notices.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { MailModule } from './mail/mail.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { CommonModule } from './common/common.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isServerless = Boolean(process.env.VERCEL);
        return {
          uri: configService.get<string>('MONGODB_URI'),
          maxPoolSize: isServerless ? 10 : 20,
          minPoolSize: isServerless ? 0 : 5,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        };
      },
    }),
    MailModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    AttendanceModule,
    LeaveModule,
    NoticesModule,
    DashboardModule,
  ],
})
export class AppModule {}
