import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    MailModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
