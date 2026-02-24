"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Pusher = require("pusher");
let PusherService = class PusherService {
    constructor(configService) {
        this.configService = configService;
        this.pusher = new Pusher({
            appId: this.configService.get('PUSHER_APP_ID'),
            key: this.configService.get('PUSHER_KEY'),
            secret: this.configService.get('PUSHER_SECRET'),
            cluster: this.configService.get('PUSHER_CLUSTER'),
            useTLS: true,
        });
    }
    async trigger(channel, event, data) {
        try {
            await this.pusher.trigger(channel, event, data);
        }
        catch (error) {
            console.error('Pusher notification error:', error);
        }
    }
    async notifyNewNotice(noticeId, title) {
        await this.trigger('notices', 'notice:new', {
            noticeId,
            title,
            timestamp: new Date().toISOString(),
        });
    }
    async notifyLeaveUpdate(leaveId, employeeId, status) {
        await this.trigger('leave', 'leave:updated', {
            leaveId,
            employeeId,
            status,
            timestamp: new Date().toISOString(),
        });
    }
    async notifyAttendanceChange(employeeId, date, status) {
        await this.trigger('attendance', 'attendance:changed', {
            employeeId,
            date,
            status,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PusherService);
//# sourceMappingURL=pusher.service.js.map