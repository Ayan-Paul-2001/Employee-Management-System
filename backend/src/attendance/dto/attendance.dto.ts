import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';

export class CheckInDto {
  @ApiPropertyOptional({ example: 'Working from HQ office' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CheckOutDto {
  @ApiPropertyOptional({ example: 'Completed sprint tasks' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class MarkAttendanceDto {
  @ApiPropertyOptional()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: '2026-11-25' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
