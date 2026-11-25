import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleNotificationMailDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;
}

export class AddMailRecipientDto {
  @ApiProperty({ example: 'hr.manager@company.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @ApiPropertyOptional({ example: 'HR Director' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;
}
