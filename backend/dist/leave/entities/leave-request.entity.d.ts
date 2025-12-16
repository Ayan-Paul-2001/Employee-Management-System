import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';
import { User } from '../../users/entities/user.entity';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
declare enum LeaveType {
    ANNUAL = "ANNUAL",
    SICK = "SICK",
    PERSONAL = "PERSONAL",
    UNPAID = "UNPAID",
    OTHER = "OTHER"
}
export declare class LeaveRequest {
    id: number;
    fromDate: Date;
    toDate: Date;
    reason: string;
    status: LeaveStatus;
    rejectionReason: string;
    type: LeaveType;
    employee: EmployeeProfile;
    employeeId: number;
    approver: User;
    approverId: number;
    createdAt: Date;
    updatedAt: Date;
}
export {};
