import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../common/enums/role.enum';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    verifyEmail(body: {
        email: string;
        code: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    resendCode(body: {
        email: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
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
            role: Role;
            isVerified: boolean;
        };
        success: boolean;
    }>;
    getCurrentUser(req: any): Promise<any>;
}
