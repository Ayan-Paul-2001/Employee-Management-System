import { Controller, Post, Body, Req, UnauthorizedException, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './role/role.decorator';
import { UserRole } from './role/role';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('admin/:id/request-reset')
  requestReset(
    @Param('id') id: string,
    @Body() dto: RequestPasswordResetDto,
  ) {
    return this.authService.requestResetPassword(id, dto); // Pass both id and dto
  }
  
  @Post('admin/:id/verify-reset-code')
  verifyResetCode(
    @Param('id') id: string,
    @Body() dto: VerifyResetCodeDto,
  ) {
    return this.authService.verifyResetCode(id, dto);
  }
  


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role(UserRole.ADMIN) // Only admins allowed
  @Post('admin/:id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: { user: { id: string, role: string } },
  ) {
    // Allow if same user OR if the logged-in user is an admin
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only reset your own password or be an admin');
    }
  
    return this.authService.resetPassword(id, dto);
  }

  @Post('requestreset')
   requestResetByEmail(@Body() dto: RequestPasswordResetDto) {
  return this.authService.requestResetByEmail(dto);
  }

  @Post('verifyresetcode')
verifyResetCodeByEmail(@Body() dto: VerifyResetCodeDto) {
  return this.authService.verifyResetCodeByEmail(dto);
}

@Post('resetpassword')
resetPasswordByEmail(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPasswordByEmail(dto);
}

  

}
