import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        user: any;
        success: boolean;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
    }>;
    register(createUserDto: CreateUserDto): Promise<import("../users/entities/user.entity").User>;
    adminRegister(createUserDto: CreateUserDto): Promise<import("../users/entities/user.entity").User>;
    getCurrentUser(req: any): Promise<any>;
}
