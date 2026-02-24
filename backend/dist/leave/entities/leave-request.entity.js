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
exports.LeaveRequest = void 0;
const typeorm_1 = require("typeorm");
const employee_profile_entity_1 = require("../../employees/entities/employee-profile.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const leave_status_enum_1 = require("../../common/enums/leave-status.enum");
var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL"] = "ANNUAL";
    LeaveType["SICK"] = "SICK";
    LeaveType["PERSONAL"] = "PERSONAL";
    LeaveType["UNPAID"] = "UNPAID";
    LeaveType["OTHER"] = "OTHER";
})(LeaveType || (LeaveType = {}));
let LeaveRequest = class LeaveRequest {
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "fromDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "toDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: leave_status_enum_1.LeaveStatus,
        default: leave_status_enum_1.LeaveStatus.PENDING,
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeaveType,
        default: LeaveType.ANNUAL,
        nullable: true
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_profile_entity_1.EmployeeProfile, (employee) => employee.leaveRequests, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_profile_entity_1.EmployeeProfile)
], LeaveRequest.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approverId' }),
    __metadata("design:type", user_entity_1.User)
], LeaveRequest.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "updatedAt", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, typeorm_1.Entity)('leave_requests')
], LeaveRequest);
//# sourceMappingURL=leave-request.entity.js.map