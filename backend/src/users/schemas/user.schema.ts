import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
import { ApprovalStatus } from '../../common/enums/approval-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      if (!ret.approvalStatus) {
        ret.approvalStatus =
          ret.isApproved === false
            ? ApprovalStatus.PENDING
            : ApprovalStatus.APPROVED;
      }
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      delete ret.passwordResetCode;
      delete ret.passwordResetCodeExpiry;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true, maxlength: 120 })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.EMPLOYEE,
    index: true,
  })
  role: Role;

  @Prop({ unique: true, sparse: true, trim: true })
  employeeCode: string;

  @Prop({ default: 'General', trim: true })
  department: string;

  @Prop({ default: 'Team Member', trim: true })
  position: string;

  @Prop({ default: '', trim: true })
  phoneNumber: string;

  @Prop({ default: '', trim: true })
  address: string;

  @Prop({ default: () => new Date() })
  dateOfJoining: Date;

  @Prop({ default: true })
  isApproved: boolean;

  @Prop({
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.APPROVED,
    index: true,
  })
  approvalStatus: ApprovalStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null, trim: true })
  rejectionReason: string | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  passwordResetCode: string | null;

  @Prop({ type: Date, default: null })
  passwordResetCodeExpiry: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
