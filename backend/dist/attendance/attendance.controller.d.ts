import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ApproveAttendanceDto } from './dto/approve-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    findAll(): Promise<import("./entities/attendance.entity").Attendance[]>;
    findByEmployeeId(employeeId: string): Promise<import("./entities/attendance.entity").Attendance[]>;
    findByDateRange(startDate: string, endDate: string): Promise<import("./entities/attendance.entity").Attendance[]>;
    findOne(id: string): Promise<import("./entities/attendance.entity").Attendance>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    checkIn(checkInDto: CheckInDto): Promise<import("./entities/attendance.entity").Attendance>;
    checkOut(checkOutDto: CheckOutDto): Promise<import("./entities/attendance.entity").Attendance>;
    approveAttendance(id: string, approveAttendanceDto: ApproveAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    findPendingAttendances(): Promise<import("./entities/attendance.entity").Attendance[]>;
    remove(id: string): Promise<void>;
}
