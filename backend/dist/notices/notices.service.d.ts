import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { UsersService } from '../users/users.service';
import { PusherService } from '../common/services/pusher.service';
export declare class NoticesService {
    private noticeRepository;
    private usersService;
    private pusherService;
    constructor(noticeRepository: Repository<Notice>, usersService: UsersService, pusherService: PusherService);
    create(createNoticeDto: CreateNoticeDto): Promise<Notice>;
    findAll(): Promise<Notice[]>;
    findOne(id: number): Promise<Notice>;
    update(id: number, updateNoticeDto: UpdateNoticeDto): Promise<Notice>;
    remove(id: number): Promise<void>;
}
