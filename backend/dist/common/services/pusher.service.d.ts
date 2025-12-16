import { ConfigService } from '@nestjs/config';
export declare class PusherService {
    private configService;
    private pusher;
    constructor(configService: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
    notifyNewNotice(noticeId: number, title: string): Promise<void>;
    notifyLeaveUpdate(leaveId: number, employeeId: number, status: string): Promise<void>;
    notifyAttendanceChange(employeeId: number, date: string, status: string): Promise<void>;
}
