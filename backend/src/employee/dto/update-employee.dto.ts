import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
