import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '../../common/enums/leave-type.enum.js';

export class CreateLeaveRequestDto {
  @ApiProperty({ enum: LeaveType, default: LeaveType.CASUAL })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiProperty({ example: '2026-12-01' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2026-12-03' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: 'Family medical appointment' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason: string;
}

export class ReviewLeaveDto {
  @ApiPropertyOptional({ example: 'Approved. Please coordinate handover.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
