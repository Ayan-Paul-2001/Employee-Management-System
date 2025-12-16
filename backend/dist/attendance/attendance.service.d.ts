import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { EmployeesService } from '../employees/employees.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ApproveAttendanceDto } from './dto/approve-attendance.dto';
import { PusherService } from '../common/services/pusher.service';
export declare class AttendanceService {
    private attendanceRepository;
    private employeesService;
    private pusherService;
    constructor(attendanceRepository: Repository<Attendance>, employeesService: EmployeesService, pusherService: PusherService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance>;
    findAll(): Promise<Attendance[]>;
    findByEmployeeId(employeeId: number): Promise<Attendance[]>;
    findByDateRange(startDate: string, endDate: string): Promise<Attendance[]>;
    findOne(id: number): Promise<Attendance>;
    update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance>;
    checkIn(checkInDto: CheckInDto): Promise<Attendance>;
    checkOut(checkOutDto: CheckOutDto): Promise<Attendance>;
    approveAttendance(id: number, approveAttendanceDto: ApproveAttendanceDto): Promise<Attendance>;
    findPendingAttendances(): Promise<Attendance[]>;
    remove(id: number): Promise<void>;
}
