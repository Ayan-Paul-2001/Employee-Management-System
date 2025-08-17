import { IsNotEmpty, IsEnum, IsString, IsNumber } from 'class-validator';
import { LeaveType } from '../entities/leave.entity';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty()
  empId: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsNotEmpty()
  @IsString()
  department: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsString()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  days: number;
}