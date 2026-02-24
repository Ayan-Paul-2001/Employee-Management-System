import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    private generateVerificationCode;
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, response: Response): Promise<{
        user: any;
        success: boolean;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        email: string;
        success: boolean;
    }>;
    adminRegister(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: number;
            fullName: string;
            email: string;
            role: import("../common/enums/role.enum").Role;
            isVerified: boolean;
        };
        success: boolean;
    }>;
    verifyEmail(email: string, code: string): Promise<{
        message: string;
        success: boolean;
    }>;
    resendVerificationCode(email: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
