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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notice_entity_1 = require("./entities/notice.entity");
const users_service_1 = require("../users/users.service");
const pusher_service_1 = require("../common/services/pusher.service");
let NoticesService = class NoticesService {
    constructor(noticeRepository, usersService, pusherService) {
        this.noticeRepository = noticeRepository;
        this.usersService = usersService;
        this.pusherService = pusherService;
    }
    async create(createNoticeDto) {
        await this.usersService.findOne(createNoticeDto.createdById);
        const newNotice = this.noticeRepository.create(createNoticeDto);
        const savedNotice = await this.noticeRepository.save(newNotice);
        await this.pusherService.notifyNewNotice(savedNotice.id, savedNotice.title);
        return savedNotice;
    }
    async findAll() {
        return this.noticeRepository.find({
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const notice = await this.noticeRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!notice) {
            throw new common_1.NotFoundException(`Notice with ID ${id} not found`);
        }
        return notice;
    }
    async update(id, updateNoticeDto) {
        const notice = await this.findOne(id);
        Object.assign(notice, updateNoticeDto);
        const updatedNotice = await this.noticeRepository.save(notice);
        await this.pusherService.notifyNewNotice(updatedNotice.id, updatedNotice.title);
        return updatedNotice;
    }
    async remove(id) {
        const notice = await this.findOne(id);
        await this.noticeRepository.remove(notice);
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notice_entity_1.Notice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        pusher_service_1.PusherService])
], NoticesService);
//# sourceMappingURL=notices.service.js.map