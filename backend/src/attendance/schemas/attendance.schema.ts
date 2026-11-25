import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum.js';
import { User } from '../../users/schemas/user.schema.js';

export type AttendanceDocument = HydratedDocument<Attendance>;

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
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  /** Calendar date formatted as YYYY-MM-DD */
  @Prop({ required: true, index: true })
  date: string;

  @Prop({ type: Date, default: null })
  checkInTime: Date | null;

  @Prop({ type: Date, default: null })
  checkOutTime: Date | null;

  @Prop({
    type: String,
    enum: Object.values(AttendanceStatus),
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Prop({ type: Number, default: 0 })
  workHours: number;

  @Prop({ default: '', trim: true })
  notes: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
