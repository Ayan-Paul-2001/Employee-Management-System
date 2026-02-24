import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeProfileDto {
  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'Engineering' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfJoining?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}