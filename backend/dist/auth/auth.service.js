"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Email not verified. Please check your inbox for the verification code.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async login(loginDto, response) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const token = this.jwtService.sign(payload);
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
    async logout(response) {
        response.clearCookie('auth_token', {
            httpOnly: true,
            path: '/',
        });
        return {
            success: true,
        };
    }
    async register(createUserDto) {
        const verificationCode = this.generateVerificationCode();
        const user = await this.usersService.create(createUserDto, verificationCode);
        await this.mailService.sendVerificationEmail(user.email, verificationCode);
        return {
            message: 'Registration successful. A verification code has been sent to your email.',
            email: user.email,
            success: true,
        };
    }
    async adminRegister(createUserDto) {
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
    async verifyEmail(email, code) {
        const user = await this.usersService.findByEmailAndCode(email, code);
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification code. Please check and try again.');
        }
        if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
            throw new common_1.BadRequestException('Verification code has expired. Please register again to receive a new code.');
        }
        await this.usersService.verifyUser(user.id);
        return {
            message: 'Email verified successfully! You can now log in.',
            success: true,
        };
    }
    async resendVerificationCode(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email address.');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('This email is already verified. You can log in.');
        }
        const newCode = this.generateVerificationCode();
        await this.usersService.updateVerificationCode(user.id, newCode);
        await this.mailService.sendVerificationEmail(user.email, newCode);
        return {
            message: 'A new verification code has been sent to your email.',
            success: true,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map