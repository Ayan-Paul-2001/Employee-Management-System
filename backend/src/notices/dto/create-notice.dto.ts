import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoticeDto {
  @ApiProperty({ example: 'Company Holiday Announcement' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'The office will be closed on July 4th for Independence Day.' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  createdById: number;
  
  @ApiProperty({ example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
  
  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}