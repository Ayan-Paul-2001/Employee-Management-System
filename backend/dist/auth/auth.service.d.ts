import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, response: Response): Promise<{
        user: any;
        success: boolean;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
    }>;
    register(createUserDto: CreateUserDto): Promise<import("../users/entities/user.entity").User>;
}
