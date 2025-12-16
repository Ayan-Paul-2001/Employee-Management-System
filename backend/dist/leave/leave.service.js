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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("./entities/leave-request.entity");
const employees_service_1 = require("../employees/employees.service");
const leave_status_enum_1 = require("../common/enums/leave-status.enum");
const pusher_service_1 = require("../common/services/pusher.service");
let LeaveService = class LeaveService {
    constructor(leaveRequestRepository, employeesService, pusherService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeesService = employeesService;
        this.pusherService = pusherService;
    }
    async create(createLeaveRequestDto) {
        await this.employeesService.findOne(createLeaveRequestDto.employeeId);
        const fromDate = new Date(createLeaveRequestDto.fromDate);
        const toDate = new Date(createLeaveRequestDto.toDate);
        if (fromDate > toDate) {
            throw new common_1.BadRequestException('From date cannot be after to date');
        }
        const overlappingLeaves = await this.leaveRequestRepository.find({
            where: [
                {
                    employeeId: createLeaveRequestDto.employeeId,
                    fromDate: (0, typeorm_2.Between)(new Date(createLeaveRequestDto.fromDate), new Date(createLeaveRequestDto.toDate)),
                    status: leave_status_enum_1.LeaveStatus.APPROVED,
                },
                {
                    employeeId: createLeaveRequestDto.employeeId,
                    toDate: (0, typeorm_2.Between)(new Date(createLeaveRequestDto.fromDate), new Date(createLeaveRequestDto.toDate)),
                    status: leave_status_enum_1.LeaveStatus.APPROVED,
                },
            ],
        });
        if (overlappingLeaves.length > 0) {
            throw new common_1.BadRequestException('Employee already has approved leave during this period');
        }
        const newLeaveRequest = this.leaveRequestRepository.create({
            ...createLeaveRequestDto,
            status: leave_status_enum_1.LeaveStatus.PENDING,
        });
        const savedLeaveRequest = await this.leaveRequestRepository.save(newLeaveRequest);
        await this.pusherService.notifyLeaveUpdate(savedLeaveRequest.id, savedLeaveRequest.employeeId, leave_status_enum_1.LeaveStatus.PENDING);
        return savedLeaveRequest;
    }
    async findAll() {
        return this.leaveRequestRepository.find({
            relations: ['employee', 'approver'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByEmployeeId(employeeId) {
        try {
            const employee = await this.employeesService.findByEmployeeId(employeeId);
            return this.leaveRequestRepository.find({
                where: { employeeId: employee.id },
                relations: ['approver'],
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            try {
                const numericId = parseInt(employeeId, 10);
                if (!isNaN(numericId)) {
                    return this.leaveRequestRepository.find({
                        where: { employeeId: numericId },
                        relations: ['approver'],
                        order: { createdAt: 'DESC' },
                    });
                }
                throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
            }
            catch (innerError) {
                throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
            }
        }
    }
    async findPendingRequests() {
        return this.leaveRequestRepository.find({
            where: { status: leave_status_enum_1.LeaveStatus.PENDING },
            relations: ['employee'],
            order: { createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ['employee', 'approver'],
        });
        if (!leaveRequest) {
            throw new common_1.NotFoundException(`Leave request with ID ${id} not found`);
        }
        return leaveRequest;
    }
    async update(id, updateLeaveRequestDto, approverId) {
        const leaveRequest = await this.findOne(id);
        Object.assign(leaveRequest, {
            ...updateLeaveRequestDto,
            approverId,
            updatedAt: new Date(),
        });
        const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);
        await this.pusherService.notifyLeaveUpdate(updatedLeaveRequest.id, updatedLeaveRequest.employeeId, updatedLeaveRequest.status);
        return updatedLeaveRequest;
    }
    async remove(id) {
        const leaveRequest = await this.findOne(id);
        await this.leaveRequestRepository.remove(leaveRequest);
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        employees_service_1.EmployeesService,
        pusher_service_1.PusherService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map