declare enum ApprovalAction {
    APPROVE = "approve",
    REJECT = "reject"
}
export declare class ApproveAttendanceDto {
    action: ApprovalAction;
    approvedBy: number;
    rejectionReason?: string;
}
export {};
