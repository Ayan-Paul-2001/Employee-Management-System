import { IsDateString, IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER'
}

export class CreateLeaveRequestDto {
  @ApiProperty({ example: '2023-07-20' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2023-07-25' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: 'Family vacation' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ example: 'ANNUAL', enum: LeaveType })
  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;
}