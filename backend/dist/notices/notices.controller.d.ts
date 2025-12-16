import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
export declare class NoticesController {
    private readonly noticesService;
    constructor(noticesService: NoticesService);
    create(createNoticeDto: CreateNoticeDto, req: any): Promise<import("./entities/notice.entity").Notice>;
    findAll(): Promise<import("./entities/notice.entity").Notice[]>;
    findOne(id: string): Promise<import("./entities/notice.entity").Notice>;
    update(id: string, updateNoticeDto: UpdateNoticeDto): Promise<import("./entities/notice.entity").Notice>;
    remove(id: string): Promise<void>;
}
