import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveStatus } from '../../common/enums/leave-status.enum';

export class UpdateLeaveRequestDto {
  @ApiProperty({ enum: LeaveStatus, example: LeaveStatus.APPROVED })
  @IsNotEmpty()
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  approverId?: number;

  @ApiProperty({ example: 'Employee is needed for an urgent project' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}