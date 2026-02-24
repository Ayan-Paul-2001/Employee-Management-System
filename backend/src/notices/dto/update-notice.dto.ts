import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateNoticeDto } from './create-notice.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateNoticeDto extends PartialType(
  OmitType(CreateNoticeDto, ['createdById'] as const),
) {
  @ApiProperty({ example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
  
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}