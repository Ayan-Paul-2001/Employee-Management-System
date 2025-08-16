import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAttendanceDto {
  @IsDate()
  @IsNotEmpty()
  clockIn: Date;

  @IsDate()
  @IsNotEmpty()
  clockOut: Date;

  @IsNumber()
  @IsNotEmpty()
  employeeId: number;
}