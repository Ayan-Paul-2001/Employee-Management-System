import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<import("./entities/user.entity").User>;
    updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
