import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema.js';

export type NotificationMailSettingsDocument =
  HydratedDocument<NotificationMailSettings>;

@Schema({ _id: false })
export class MailRecipient {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  label: string;

  @Prop({ type: Date, default: () => new Date() })
  addedAt: Date;
}

export const MailRecipientSchema = SchemaFactory.createForClass(MailRecipient);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class NotificationMailSettings {
  @Prop({ required: true, unique: true, default: 'registration_mail' })
  key: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: [MailRecipientSchema], default: [] })
  recipients: MailRecipient[];

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  updatedBy: Types.ObjectId | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationMailSettingsSchema = SchemaFactory.createForClass(
  NotificationMailSettings,
);
