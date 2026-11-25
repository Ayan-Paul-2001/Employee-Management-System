import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema.js';
import {
  NotificationMailSettings,
  NotificationMailSettingsDocument,
} from './schemas/notification-mail-settings.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { Role } from '../common/enums/role.enum.js';
import { CacheService } from '../common/cache.service.js';
import { MailService } from '../mail/mail.service.js';

const SETTINGS_KEY = 'registration_mail';
const MAIL_SETTINGS_CACHE_KEY = 'notification-mail:settings';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationMailSettings.name)
    private readonly mailSettingsModel: Model<NotificationMailSettingsDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    await this.ensureMailSettings();
  }

  private async ensureMailSettings(): Promise<NotificationMailSettingsDocument> {
    const defaultEmail = this.configService
      .get<string>('HR_NOTIFICATION_EMAIL')
      ?.trim()
      .toLowerCase();

    return this.mailSettingsModel
      .findOneAndUpdate(
        { key: SETTINGS_KEY },
        {
          $setOnInsert: {
            key: SETTINGS_KEY,
            enabled: true,
            recipients: defaultEmail
              ? [
                  {
                    email: defaultEmail,
                    label: 'Default HR Alert Inbox',
                    addedAt: new Date(),
                  },
                ]
              : [],
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getMailSettings() {
    return this.cacheService.getOrSet(MAIL_SETTINGS_CACHE_KEY, async () => {
      const doc = await this.ensureMailSettings();
      const json: any = doc.toJSON();
      return {
        enabled: Boolean(json.enabled),
        recipients: (json.recipients || []).map((r: any) => ({
          email: r.email,
          label: r.label || '',
          addedAt: r.addedAt,
        })),
        updatedAt: json.updatedAt,
      };
    });
  }

  async toggleMailSettings(enabled: boolean, actorId: string) {
    const doc = await this.ensureMailSettings();
    doc.enabled = enabled;
    doc.updatedBy = new Types.ObjectId(actorId);
    await doc.save();
    this.cacheService.invalidatePrefix('notification-mail:');
    return this.getMailSettings();
  }

  async addMailRecipient(emailRaw: string, label: string | undefined, actorId: string) {
    const email = emailRaw.trim().toLowerCase();
    const doc = await this.ensureMailSettings();

    const exists = doc.recipients.some(
      (r) => r.email.trim().toLowerCase() === email,
    );
    if (exists) {
      throw new ConflictException(`${email} is already in the notification list.`);
    }

    doc.recipients.unshift({
      email,
      label: label?.trim() || '',
      addedAt: new Date(),
    });
    doc.updatedBy = new Types.ObjectId(actorId);
    await doc.save();
    this.cacheService.invalidatePrefix('notification-mail:');
    return this.getMailSettings();
  }

  async removeMailRecipient(emailRaw: string, actorId: string) {
    const email = (emailRaw || '').trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email query parameter is required.');
    }

    const doc = await this.ensureMailSettings();
    const before = doc.recipients.length;
    doc.recipients = doc.recipients.filter(
      (r) => r.email.trim().toLowerCase() !== email,
    );

    if (doc.recipients.length === before) {
      throw new NotFoundException(`Email ${email} not found in recipient list.`);
    }

    doc.updatedBy = new Types.ObjectId(actorId);
    await doc.save();
    this.cacheService.invalidatePrefix('notification-mail:');
    return this.getMailSettings();
  }

  async sendTestRegistrationMail() {
    const settings = await this.getMailSettings();
    if (!settings.enabled) {
      throw new BadRequestException(
        'Turn ON the Notification Mail system first before sending a test email.',
      );
    }
    if (!settings.recipients.length) {
      throw new BadRequestException(
        'Add at least one recipient email address before sending a test email.',
      );
    }

    const emails = settings.recipients.map((r) => r.email);
    await this.mailService.sendNewRegistrationAlertToAdminsAndHr(emails, {
      fullName: 'Test Registration Preview',
      email: 'preview.employee@nexthunt.com',
      employeeCode: 'NH-TEST',
      department: 'Human Resources',
      createdAt: new Date(),
    });

    return {
      success: true,
      sentTo: emails,
      message: `Test registration alert sent to ${emails.length} recipient(s).`,
    };
  }

  async createForUser(
    recipientId: string | Types.ObjectId,
    payload: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, any>;
    },
  ): Promise<NotificationDocument> {
    return this.notificationModel.create({
      recipientId: new Types.ObjectId(recipientId.toString()),
      ...payload,
    });
  }

  async createForRoles(
    roles: Role[],
    payload: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, any>;
    },
    excludeUserId?: string,
  ): Promise<void> {
    const query: any = { role: { $in: roles }, isActive: true };
    if (excludeUserId && Types.ObjectId.isValid(excludeUserId)) {
      query._id = { $ne: new Types.ObjectId(excludeUserId) };
    }
    const recipients = await this.userModel.find(query).select('_id').lean();
    if (recipients.length === 0) return;

    await this.notificationModel.insertMany(
      recipients.map((u) => ({
        recipientId: u._id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        metadata: payload.metadata || {},
        isRead: false,
      })),
    );
  }

  async findForUser(userId: string, limit = 30) {
    const recipientObjId = new Types.ObjectId(userId);
    const [items, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ recipientId: recipientObjId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({
        recipientId: recipientObjId,
        isRead: false,
      }),
    ]);

    return {
      items: items.map(({ _id, __v, ...rest }: any) => ({
        ...rest,
        id: _id.toString(),
      })),
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Notification not found');
    }
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), recipientId: new Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Notification not found');
    }
    return updated.toJSON();
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    );
    return { success: true };
  }
}
