import { IsOptional,IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {

      @IsEmail()
      email: string;
      @IsString()
      @IsOptional()
      @MinLength(6)
      @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
        message: 'Password must contain at least one letter and one number',
      })
      newPassword: string;
}
