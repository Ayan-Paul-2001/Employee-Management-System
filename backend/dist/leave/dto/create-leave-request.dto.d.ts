declare enum LeaveType {
    ANNUAL = "ANNUAL",
    SICK = "SICK",
    PERSONAL = "PERSONAL",
    UNPAID = "UNPAID",
    OTHER = "OTHER"
}
export declare class CreateLeaveRequestDto {
    fromDate: string;
    toDate: string;
    reason: string;
    type?: LeaveType;
    employeeId: number;
}
export {};
