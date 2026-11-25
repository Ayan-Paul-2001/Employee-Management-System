import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LeaveStatus } from '../../common/enums/leave-status.enum.js';
import { LeaveType } from '../../common/enums/leave-type.enum.js';
import { User } from '../../users/schemas/user.schema.js';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

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
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(LeaveType),
    default: LeaveType.CASUAL,
  })
  leaveType: LeaveType;

  @Prop({ type: Date, required: true })
  fromDate: Date;

  @Prop({ type: Date, required: true })
  toDate: Date;

  @Prop({ type: Number, required: true, min: 1 })
  days: number;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  reason: string;

  @Prop({
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
    index: true,
  })
  status: LeaveStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  reviewedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null, trim: true })
  reviewNote: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
