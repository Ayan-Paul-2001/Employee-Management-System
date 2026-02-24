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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const role_enum_1 = require("../common/enums/role.enum");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto, verificationCode) {
        const { email, password, ...rest } = createUserDto;
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            if (!existingUser.isVerified) {
                await this.usersRepository.remove(existingUser);
            }
            else {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = this.usersRepository.create({
            ...rest,
            email,
            passwordHash,
            role: rest.role?.toLowerCase() || role_enum_1.Role.EMPLOYEE,
            verificationToken: verificationCode,
            isVerified: false,
            verificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
        });
        return this.usersRepository.save(newUser);
    }
    async createVerified(createUserDto) {
        const { email, password, ...rest } = createUserDto;
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = this.usersRepository.create({
            ...rest,
            email,
            passwordHash,
            role: rest.role?.toLowerCase(),
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        });
        return this.usersRepository.save(newUser);
    }
    async findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async changePassword(id, currentPassword, newPassword) {
        const user = await this.findOne(id);
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        user.passwordHash = passwordHash;
        return this.usersRepository.save(user);
    }
    async updateRole(id, updateRoleDto) {
        const user = await this.findOne(id);
        user.role = updateRoleDto.role.toLowerCase();
        return this.usersRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
    async findByVerificationToken(token) {
        return this.usersRepository.findOne({ where: { verificationToken: token } });
    }
    async findByEmailAndCode(email, code) {
        return this.usersRepository.findOne({
            where: { email, verificationToken: code }
        });
    }
    async verifyUser(id) {
        const user = await this.findOne(id);
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        return this.usersRepository.save(user);
    }
    async updateVerificationCode(id, code) {
        const user = await this.findOne(id);
        user.verificationToken = code;
        user.verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map