import { IsDate, IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAttendanceDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  checkIn: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      return new Date(value);
    } catch (error) {
      return undefined;
    }
  })
  checkOut?: Date;

  @IsNumber()
  @IsNotEmpty()
  employeeId: number;
  
  @IsString()
  @IsNotEmpty()
  employeeName: string;
  
  @IsString()
  @IsNotEmpty()
  position: string;
  
  @IsString()
  @IsNotEmpty()
  date: string;
  
  @IsBoolean()
  @IsOptional()
  isLate?: boolean;
  
  @IsBoolean()
  @IsOptional()
  isAbsent?: boolean;
}