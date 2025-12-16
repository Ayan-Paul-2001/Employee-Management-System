import { AttendanceStatus } from '../../common/enums/attendance-status.enum';
export declare class CreateAttendanceDto {
    date: string;
    status: AttendanceStatus;
    notes?: string;
    checkInTime?: string;
    checkOutTime?: string;
    employeeId: number;
}
