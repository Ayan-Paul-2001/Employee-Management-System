import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ProfileResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) { }

  private generateSixDigitCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private issueAuthCookie(response: Response, user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    const maxAgeSeconds = Number(this.configService.get<string>('JWT_EXPIRATION') || 86400);

    response.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: maxAgeSeconds * 1000,
      path: '/',
    });

    return token;
  }

  async register(dto: CreateUserDto, response: Response) {
    const newUser = await this.usersService.createEmployee(dto);
    const safeUser = newUser.toJSON() as any;

    // Create dashboard notifications for all HR & Admin users
    await this.notificationsService.createForRoles([Role.HR, Role.ADMIN], {
      type: NotificationType.USER_REGISTERED,
      title: 'New Employment Applicant Waiting',
      message: `${safeUser.fullName} (${safeUser.employeeCode}) applied to join ${safeUser.department} and is awaiting HR/Admin approval.`,
      metadata: {
        userId: safeUser.id,
        email: safeUser.email,
        employeeCode: safeUser.employeeCode,
        approvalStatus: safeUser.approvalStatus,
      },
    });

    // Check HR Notification Mail settings (ON/OFF toggle + HR-configured recipient list)
    const mailSettings = await this.notificationsService.getMailSettings();
    const configuredRecipients =
      mailSettings.enabled && mailSettings.recipients.length > 0
        ? mailSettings.recipients.map((r) => r.email)
        : [];

    const emailJobs: Promise<void>[] = [
      this.mailService.sendWelcomeEmail({
        fullName: safeUser.fullName,
        email: safeUser.email,
        employeeCode: safeUser.employeeCode,
      }),
    ];

    if (configuredRecipients.length > 0) {
      emailJobs.push(
        this.mailService.sendNewRegistrationAlertToAdminsAndHr(
          configuredRecipients,
          {
            fullName: safeUser.fullName,
            email: safeUser.email,
            employeeCode: safeUser.employeeCode,
            department: safeUser.department,
            createdAt: safeUser.createdAt,
          },
        ),
      );
    }

    await Promise.allSettled(emailJobs);

    const accessToken = this.issueAuthCookie(response, safeUser);

    return {
      success: true,
      message: 'Account created successfully! Welcome to Next Hunt Management System.',
      user: safeUser,
      accessToken,
    };
  }

  async login(dto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Contact HR.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const safeUser = user.toJSON() as any;
    const accessToken = this.issueAuthCookie(response, safeUser);

    return {
      success: true,
      user: safeUser,
      accessToken,
    };
  }

  async logout(response: Response) {
    response.clearCookie('auth_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }

    const code = this.generateSixDigitCode();
    await this.usersService.setPasswordResetCode(user._id.toString(), code, 15);
    await this.mailService.sendPasswordResetCodeEmail(
      user.email,
      user.fullName,
      code,
      'forgot',
    );

    return {
      success: true,
      message: 'A 6-digit verification code has been sent to your email address.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.usersService.resetPasswordWithCode(
      dto.email,
      dto.code,
      dto.newPassword,
    );

    return {
      success: true,
      message: 'Password has been reset successfully. You can now sign in.',
    };
  }

  async changeProfilePassword(userId: string, dto: ChangePasswordDto) {
    await this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );

    return {
      success: true,
      message: 'Your password has been updated successfully.',
    };
  }

  async requestProfilePasswordCode(userId: string) {
    const user = await this.usersService.findOne(userId);
    const code = this.generateSixDigitCode();
    await this.usersService.setPasswordResetCode(user._id.toString(), code, 15);
    await this.mailService.sendPasswordResetCodeEmail(
      user.email,
      user.fullName,
      code,
      'profile',
    );

    return {
      success: true,
      email: user.email,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
    };
  }

  async resetProfilePassword(userId: string, dto: ProfileResetPasswordDto) {
    const user = await this.usersService.findOne(userId);
    await this.usersService.resetPasswordWithCode(
      user.email,
      dto.code,
      dto.newPassword,
    );

    return {
      success: true,
      message: 'Your password has been updated successfully.',
    };
  }
}
