import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2023-07-15' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ example: 'Working from home', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '09:00:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Check-in time must be in the format HH:MM:SS or HH:MM' })
  checkInTime?: string;

  @ApiProperty({ example: '17:00:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Check-out time must be in the format HH:MM:SS or HH:MM' })
  checkOutTime?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;
}