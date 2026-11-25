import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NoticeCategory, NoticePriority } from '../../common/enums/notice.enum';
import { User } from '../../users/schemas/user.schema';

export type NoticeDocument = HydratedDocument<Notice>;

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
export class Notice {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(NoticePriority),
    default: NoticePriority.NORMAL,
  })
  priority: NoticePriority;

  @Prop({
    type: String,
    enum: Object.values(NoticeCategory),
    default: NoticeCategory.GENERAL,
  })
  category: NoticeCategory;

  @Prop({ default: false })
  pinned: boolean;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
