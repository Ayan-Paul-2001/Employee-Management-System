import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema.js';
import {
  NotificationMailSettings,
  NotificationMailSettingsSchema,
} from './schemas/notification-mail-settings.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationMailController } from './notification-mail.controller.js';
import { MailModule } from '../mail/mail.module.js';

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
