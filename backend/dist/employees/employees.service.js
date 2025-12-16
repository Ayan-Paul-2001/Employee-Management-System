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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_profile_entity_1 = require("./entities/employee-profile.entity");
const users_service_1 = require("../users/users.service");
let EmployeesService = class EmployeesService {
    constructor(employeeProfileRepository, usersService) {
        this.employeeProfileRepository = employeeProfileRepository;
        this.usersService = usersService;
    }
    async create(createEmployeeProfileDto) {
        console.log('Creating employee profile with DTO:', createEmployeeProfileDto);
        const existingEmployee = await this.employeeProfileRepository.findOne({
            where: { employeeId: createEmployeeProfileDto.employeeId },
        });
        if (existingEmployee) {
            throw new common_1.ConflictException(`Employee with ID ${createEmployeeProfileDto.employeeId} already exists`);
        }
        try {
            await this.usersService.findOne(createEmployeeProfileDto.userId);
            const newEmployeeProfile = this.employeeProfileRepository.create(createEmployeeProfileDto);
            const savedProfile = await this.employeeProfileRepository.save(newEmployeeProfile);
            console.log('Successfully created employee profile:', savedProfile);
            return savedProfile;
        }
        catch (error) {
            console.error('Error creating employee profile:', error);
            throw error;
        }
    }
    async findAll() {
        return this.employeeProfileRepository.find({
            relations: ['user'],
        });
    }
    async findOne(id) {
        const employeeProfile = await this.employeeProfileRepository.findOne({
            where: { id: typeof id === 'string' ? parseInt(id) : id },
            relations: ['user'],
        });
        if (!employeeProfile) {
            throw new common_1.NotFoundException(`Employee profile with ID ${id} not found`);
        }
        return employeeProfile;
    }
    async findByEmployeeId(employeeId) {
        const employeeProfile = await this.employeeProfileRepository.findOne({
            where: { employeeId },
            relations: ['user'],
        });
        if (!employeeProfile) {
            throw new common_1.NotFoundException(`Employee profile with employee ID ${employeeId} not found`);
        }
        return employeeProfile;
    }
    async findByUserId(userId) {
        const employeeProfile = await this.employeeProfileRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!employeeProfile) {
            throw new common_1.NotFoundException(`Employee profile for user ID ${userId} not found`);
        }
        return employeeProfile;
    }
    async update(id, updateEmployeeProfileDto) {
        const employeeProfile = await this.findOne(id);
        if (updateEmployeeProfileDto.employeeId &&
            updateEmployeeProfileDto.employeeId !== employeeProfile.employeeId) {
            const existingEmployee = await this.employeeProfileRepository.findOne({
                where: { employeeId: updateEmployeeProfileDto.employeeId },
            });
            if (existingEmployee) {
                throw new common_1.ConflictException(`Employee with ID ${updateEmployeeProfileDto.employeeId} already exists`);
            }
        }
        Object.assign(employeeProfile, updateEmployeeProfileDto);
        return this.employeeProfileRepository.save(employeeProfile);
    }
    async remove(id) {
        const employeeProfile = await this.findOne(id);
        await this.employeeProfileRepository.remove(employeeProfile);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_profile_entity_1.EmployeeProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map