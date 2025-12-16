import { User } from '../../users/entities/user.entity';
export declare class Notice {
    id: number;
    title: string;
    body: string;
    createdBy: User;
    createdById: number;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
