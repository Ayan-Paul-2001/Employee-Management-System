import { CreateNoticeDto } from './create-notice.dto';
declare const UpdateNoticeDto_base: import("@nestjs/common").Type<Partial<Omit<CreateNoticeDto, "createdById">>>;
export declare class UpdateNoticeDto extends UpdateNoticeDto_base {
    expiresAt?: string;
    isActive?: boolean;
}
export {};
