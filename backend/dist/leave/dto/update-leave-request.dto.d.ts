import { LeaveStatus } from '../../common/enums/leave-status.enum';
export declare class UpdateLeaveRequestDto {
    status: LeaveStatus;
    approverId?: number;
    rejectionReason?: string;
}
