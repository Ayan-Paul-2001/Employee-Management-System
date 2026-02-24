import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject'
}

export class ApproveAttendanceDto {
  @ApiProperty({ enum: ApprovalAction, example: ApprovalAction.APPROVE })
  @IsNotEmpty()
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  approvedBy: number;

  @ApiProperty({ example: 'Rejected due to late submission', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}