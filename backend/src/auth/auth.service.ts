import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  /** Generate a random 6-digit verification code */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified. Please check your inbox for the verification code.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: parseInt(this.configService.get('JWT_EXPIRATION')) * 1000,
      path: '/',
    };

    response.cookie('auth_token', token, cookieOptions);

    return {
      user,
      success: true,
    };
  }

  async logout(response: Response) {
    response.clearCookie('auth_token', {
      httpOnly: true,
      path: '/',
    });

    return {
      success: true,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const verificationCode = this.generateVerificationCode();
    const user = await this.usersService.create(createUserDto, verificationCode);

    // Send verification email with the code
    await this.mailService.sendVerificationEmail(user.email, verificationCode);

    return {
      message: 'Registration successful. A verification code has been sent to your email.',
      email: user.email,
      success: true,
    };
  }

  /** Create an admin/hr user directly by HR — no email verification required */
  async adminRegister(createUserDto: CreateUserDto) {
    const user = await this.usersService.createVerified(createUserDto);
    return {
      message: `${user.role} account created successfully. They can log in immediately.`,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      success: true,
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmailAndCode(email, code);
    if (!user) {
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    // Check if the code has expired
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      throw new BadRequestException('Verification code has expired. Please register again to receive a new code.');
    }

    await this.usersService.verifyUser(user.id);

    return {
      message: 'Email verified successfully! You can now log in.',
      success: true,
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }

    if (user.isVerified) {
      throw new BadRequestException('This email is already verified. You can log in.');
    }

    const newCode = this.generateVerificationCode();
    await this.usersService.updateVerificationCode(user.id, newCode);
    await this.mailService.sendVerificationEmail(user.email, newCode);

    return {
      message: 'A new verification code has been sent to your email.',
      success: true,
    };
  }
}