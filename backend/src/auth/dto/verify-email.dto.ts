import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
