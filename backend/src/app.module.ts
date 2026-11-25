import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { NoticesModule } from './notices/notices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CommonModule } from './common/common.module';

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
