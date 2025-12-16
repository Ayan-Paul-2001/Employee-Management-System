import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get<string>('PUSHER_APP_ID'),
      key: this.configService.get<string>('PUSHER_KEY'),
      secret: this.configService.get<string>('PUSHER_SECRET'),
      cluster: this.configService.get<string>('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any): Promise<void> {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      console.error('Pusher notification error:', error);
    }
  }

  // Helper methods for specific notification types
  async notifyNewNotice(noticeId: number, title: string): Promise<void> {
    await this.trigger('notices', 'notice:new', {
      noticeId,
      title,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyLeaveUpdate(leaveId: number, employeeId: number, status: string): Promise<void> {
    await this.trigger('leave', 'leave:updated', {
      leaveId,
      employeeId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyAttendanceChange(employeeId: number, date: string, status: string): Promise<void> {
    await this.trigger('attendance', 'attendance:changed', {
      employeeId,
      date,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}