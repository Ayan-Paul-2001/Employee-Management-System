import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';
export declare enum ApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Attendance {
    id: number;
    date: Date;
    status: AttendanceStatus;
    notes: string;
    checkInTime: Date;
    checkOutTime: Date;
    approvalStatus: ApprovalStatus;
    approvedBy: number;
    rejectionReason: string;
    employee: EmployeeProfile;
    employeeId: number;
    createdAt: Date;
    updatedAt: Date;
}
