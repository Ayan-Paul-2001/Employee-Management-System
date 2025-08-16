import { IsEnum } from 'class-validator';
import { LeaveStatus } from '../entities/leave-request.entity';

export class LeaveApprovalDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
} 