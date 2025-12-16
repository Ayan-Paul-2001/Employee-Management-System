import { User } from '../../users/entities/user.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
export declare class EmployeeProfile {
    id: number;
    employeeId: string;
    department: string;
    position: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: Date;
    dateOfJoining: Date;
    user: User;
    userId: number;
    attendanceRecords: Attendance[];
    leaveRequests: LeaveRequest[];
    createdAt: Date;
    updatedAt: Date;
}
