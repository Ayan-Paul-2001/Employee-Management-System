import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  NotificationMailSettings,
  NotificationMailSettingsSchema,
} from './schemas/notification-mail-settings.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationMailController } from './notification-mail.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      {
        name: NotificationMailSettings.name,
        schema: NotificationMailSettingsSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  controllers: [NotificationsController, NotificationMailController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
