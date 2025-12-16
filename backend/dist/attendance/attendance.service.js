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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("./entities/attendance.entity");
const employees_service_1 = require("../employees/employees.service");
const attendance_status_enum_1 = require("../common/enums/attendance-status.enum");
const pusher_service_1 = require("../common/services/pusher.service");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepository, employeesService, pusherService) {
        this.attendanceRepository = attendanceRepository;
        this.employeesService = employeesService;
        this.pusherService = pusherService;
    }
    async create(createAttendanceDto) {
        await this.employeesService.findOne(createAttendanceDto.employeeId);
        const existingAttendance = await this.attendanceRepository.findOne({
            where: {
                date: new Date(createAttendanceDto.date),
                employeeId: createAttendanceDto.employeeId,
            },
        });
        if (existingAttendance) {
            throw new common_1.ConflictException(`Attendance record already exists for employee ID ${createAttendanceDto.employeeId} on ${createAttendanceDto.date}`);
        }
        const newAttendance = this.attendanceRepository.create({
            ...createAttendanceDto,
            approvalStatus: attendance_entity_1.ApprovalStatus.PENDING
        });
        return this.attendanceRepository.save(newAttendance);
    }
    async findAll() {
        return this.attendanceRepository.find({
            relations: ['employee'],
            order: { date: 'DESC' },
        });
    }
    async findByEmployeeId(employeeId) {
        await this.employeesService.findOne(employeeId);
        return this.attendanceRepository.find({
            where: { employeeId },
            order: { date: 'DESC' },
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.attendanceRepository.find({
            where: {
                date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
            },
            relations: ['employee'],
            order: { date: 'DESC' },
        });
    }
    async findOne(id) {
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException(`Invalid attendance ID: ${id}`);
        }
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance record with ID ${id} not found`);
        }
        return attendance;
    }
    async update(id, updateAttendanceDto) {
        const attendance = await this.findOne(id);
        Object.assign(attendance, updateAttendanceDto);
        return this.attendanceRepository.save(attendance);
    }
    async checkIn(checkInDto) {
        const { employeeId, notes } = checkInDto;
        await this.employeesService.findOne(employeeId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let attendance = await this.attendanceRepository.findOne({
            where: { employeeId, date: today },
        });
        const now = new Date();
        const checkInTime = now.toTimeString().split(' ')[0];
        if (attendance) {
            if (attendance.checkInTime) {
                throw new common_1.ConflictException('Already checked in for today');
            }
            const checkInDate = new Date();
            const [hours, minutes, seconds] = checkInTime.split(':').map(Number);
            checkInDate.setHours(hours, minutes, seconds || 0, 0);
            attendance.checkInTime = checkInDate;
            attendance.status = attendance_status_enum_1.AttendanceStatus.PRESENT;
            if (notes)
                attendance.notes = notes;
            const savedAttendance = await this.attendanceRepository.save(attendance);
            await this.pusherService.notifyAttendanceChange(employeeId, today.toISOString().split('T')[0], 'checked-in');
            return savedAttendance;
        }
        else {
            const checkInDate = new Date();
            const [hours, minutes, seconds] = checkInTime.split(':').map(Number);
            checkInDate.setHours(hours, minutes, seconds || 0, 0);
            const newAttendance = this.attendanceRepository.create({
                employeeId,
                date: today,
                checkInTime: checkInDate,
                status: attendance_status_enum_1.AttendanceStatus.PRESENT,
                notes,
                approvalStatus: attendance_entity_1.ApprovalStatus.PENDING
            });
            const savedAttendance = await this.attendanceRepository.save(newAttendance);
            await this.pusherService.notifyAttendanceChange(employeeId, today.toISOString().split('T')[0], 'checked-in');
            return savedAttendance;
        }
    }
    async checkOut(checkOutDto) {
        const { employeeId, notes } = checkOutDto;
        await this.employeesService.findOne(employeeId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await this.attendanceRepository.findOne({
            where: { employeeId, date: today },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('No check-in record found for today');
        }
        if (!attendance.checkInTime) {
            throw new common_1.BadRequestException('Cannot check out without checking in first');
        }
        if (attendance.checkOutTime) {
            throw new common_1.ConflictException('Already checked out for today');
        }
        const now = new Date();
        const checkOutTime = now.toTimeString().split(' ')[0];
        const checkOutDate = new Date();
        const [hours, minutes, seconds] = checkOutTime.split(':').map(Number);
        checkOutDate.setHours(hours, minutes, seconds || 0, 0);
        attendance.checkOutTime = checkOutDate;
        if (notes)
            attendance.notes = `${attendance.notes || ''} ${notes}`.trim();
        const savedAttendance = await this.attendanceRepository.save(attendance);
        await this.pusherService.notifyAttendanceChange(employeeId, today.toISOString().split('T')[0], 'checked-out');
        return savedAttendance;
    }
    async approveAttendance(id, approveAttendanceDto) {
        const attendance = await this.findOne(id);
        const { action, approvedBy, rejectionReason } = approveAttendanceDto;
        await this.employeesService.findOne(approvedBy);
        if (action === 'approve') {
            attendance.approvalStatus = attendance_entity_1.ApprovalStatus.APPROVED;
            attendance.approvedBy = approvedBy;
        }
        else if (action === 'reject') {
            if (!rejectionReason) {
                throw new common_1.BadRequestException('Rejection reason is required when rejecting attendance');
            }
            attendance.approvalStatus = attendance_entity_1.ApprovalStatus.REJECTED;
            attendance.approvedBy = approvedBy;
            attendance.rejectionReason = rejectionReason;
        }
        else {
            throw new common_1.BadRequestException('Invalid action. Must be either "approve" or "reject"');
        }
        const savedAttendance = await this.attendanceRepository.save(attendance);
        await this.pusherService.notifyAttendanceChange(attendance.employeeId, attendance.date.toISOString().split('T')[0], `attendance-${action}d`);
        return savedAttendance;
    }
    async findPendingAttendances() {
        return this.attendanceRepository.find({
            where: { approvalStatus: attendance_entity_1.ApprovalStatus.PENDING },
            relations: ['employee'],
        });
    }
    async remove(id) {
        const attendance = await this.findOne(id);
        await this.attendanceRepository.remove(attendance);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        employees_service_1.EmployeesService,
        pusher_service_1.PusherService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map