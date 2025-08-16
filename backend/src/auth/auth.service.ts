import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admin/entities/admin.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './role/role';
import { User } from './entities/user.entity';
import { EmailService } from './email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RequestPasswordResetDto } from './dto/request-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const CACHE_TTL = 600_000; // 10 minutes in milliseconds

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Register a new user
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `verify:${dto.email}`;

    await this.cacheManager.set(
      key,
      {
        ...dto,
        password: hashedPassword,
        verificationCode,
      },
      CACHE_TTL,
    );

    await this.emailService.sendVerificationEmail(dto.email, verificationCode);
    return { message: 'Verification code sent. Please check your email.' };
  }

  // Verify email and create user account
  async verifyEmail(dto: VerifyEmailDto) {
    const key = `verify:${dto.email}`;
    const cached = await this.cacheManager.get<any>(key);

    if (!cached || cached.verificationCode !== dto.code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const user = this.userRepo.create({
      email: cached.email,
      password: cached.password,
      name: cached.name,
      role: cached.role,
      isVerified: true,
    });

    const savedUser = await this.userRepo.save(user);

    if (cached.role === UserRole.ADMIN) {
      const admin = this.adminRepo.create({ user: savedUser });
      await this.adminRepo.save(admin);
    }

    await this.cacheManager.del(key);
    return { message: 'Email verified and account created successfully' };
  }

  // Login user
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid password');

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      role: user.role,
      message: `Welcome ${user.name}, you are logged in as ${user.role}`,
    };
  }

  // Request password reset
  async requestResetPassword(id: string, dto: RequestPasswordResetDto) {
    const user = await this.userRepo.findOne({ where: { id: Number(id), email: dto.email } });
    if (!user) throw new BadRequestException('User not found');
  
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `reset:${id}`;
  
    await this.cacheManager.set(key, {
      email: dto.email,
      code,
    }, 600_000); // 10 minutes
  
    await this.emailService.sendVerificationEmail(dto.email, code);
  
    return { message: 'Verification code sent to your email' };
  }
  

  // Verify reset code
  async verifyResetCode(id: string, dto: VerifyResetCodeDto) {
    const key = `reset:${id}`;
    const cached = await this.cacheManager.get<any>(key);
  
    if (!cached || cached.code !== dto.code) {
      throw new BadRequestException('Invalid or expired code');
    }
  
    // Save a separate flag that allows reset only once
    await this.cacheManager.set(`${key}:verified`, true, 600_000);
    await this.cacheManager.del(key); // delete the code so it's one-time
  
    return { message: 'Code verified. You may now reset your password.' };
  }
  
  

 // AuthService

 async resetPassword(userId: string, dto: ResetPasswordDto) {
  const verified = await this.cacheManager.get(`reset:${userId}:verified`);
  if (!verified) {
    throw new BadRequestException('Reset code not verified or already used');
  }

  const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
  if (!user) throw new BadRequestException('User not found');

  const hashed = await bcrypt.hash(dto.newPassword, 10);
  user.password = hashed;
  await this.userRepo.save(user);

  await this.cacheManager.del(`reset:${userId}:verified`); // prevent reuse

  return { message: 'Password has been reset successfully' };
}

async requestResetByEmail(dto: RequestPasswordResetDto) {
  const user = await this.userRepo.findOne({ where: { email: dto.email } });
  if (!user) throw new BadRequestException('User not found');

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `reset:${dto.email}`;

  await this.cacheManager.set(key, { code }, 600_000); // 10 mins
  await this.emailService.sendVerificationEmail(dto.email, code);

  return { message: 'Verification code sent to email' };
}

async verifyResetCodeByEmail(dto: VerifyResetCodeDto) {
  const key = `reset:${dto.email}`;
  const cached = await this.cacheManager.get<any>(key);

  if (!cached || cached.code !== dto.code) {
    throw new BadRequestException('Invalid or expired code');
  }

  await this.cacheManager.set(`${key}:verified`, true, 600_000); // allow reset
  await this.cacheManager.del(key); // prevent reuse of code

  return { message: 'Code verified. You may now reset your password.' };
}

async resetPasswordByEmail(dto: ResetPasswordDto) {
  const verified = await this.cacheManager.get(`reset:${dto.email}:verified`);
  if (!verified) {
    throw new BadRequestException('Code not verified or already used');
  }

  const user = await this.userRepo.findOne({ where: { email: dto.email } });
  if (!user) throw new BadRequestException('User not found');

  const hashed = await bcrypt.hash(dto.newPassword, 10);
  user.password = hashed;
  await this.userRepo.save(user);

  await this.cacheManager.del(`reset:${dto.email}:verified`);

  return { message: 'Password has been reset successfully' };
}



}
  

