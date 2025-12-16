import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    findAll(): Promise<import("./entities/leave-request.entity").LeaveRequest[]>;
    findByEmployeeId(employeeId: string): Promise<import("./entities/leave-request.entity").LeaveRequest[]>;
    findPendingRequests(): Promise<import("./entities/leave-request.entity").LeaveRequest[]>;
    findOne(id: string): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    update(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto, req: any): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    approve(id: string, req: any): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    reject(id: string, body: {
        reason?: string;
    }, req: any): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    remove(id: string): Promise<void>;
}
