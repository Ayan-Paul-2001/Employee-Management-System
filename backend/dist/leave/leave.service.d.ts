import { Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { EmployeesService } from '../employees/employees.service';
import { PusherService } from '../common/services/pusher.service';
export declare class LeaveService {
    private leaveRequestRepository;
    private employeesService;
    private pusherService;
    constructor(leaveRequestRepository: Repository<LeaveRequest>, employeesService: EmployeesService, pusherService: PusherService);
    create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest>;
    findAll(): Promise<LeaveRequest[]>;
    findByEmployeeId(employeeId: string): Promise<LeaveRequest[]>;
    findPendingRequests(): Promise<LeaveRequest[]>;
    findOne(id: number): Promise<LeaveRequest>;
    update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto, approverId: number): Promise<LeaveRequest>;
    remove(id: number): Promise<void>;
}
