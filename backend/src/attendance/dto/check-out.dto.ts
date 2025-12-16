import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOutDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiProperty({ example: 'Completed all tasks', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}