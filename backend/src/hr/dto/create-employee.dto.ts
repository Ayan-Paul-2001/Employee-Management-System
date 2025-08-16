import { IsString, IsEmail, IsNotEmpty, MinLength, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  department: string;

  @IsString()
  designation: string;

  @IsDateString()
  joining_date: string;
} 