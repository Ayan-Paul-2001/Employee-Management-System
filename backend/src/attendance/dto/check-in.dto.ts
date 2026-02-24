import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiProperty({ example: 'Working from office', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}