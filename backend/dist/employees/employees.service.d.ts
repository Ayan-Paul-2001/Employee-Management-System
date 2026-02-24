import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { UsersService } from '../users/users.service';
export declare class EmployeesService {
    private employeeProfileRepository;
    private usersService;
    constructor(employeeProfileRepository: Repository<EmployeeProfile>, usersService: UsersService);
    create(createEmployeeProfileDto: CreateEmployeeProfileDto): Promise<EmployeeProfile>;
    findAll(): Promise<EmployeeProfile[]>;
    findOne(id: number | string): Promise<EmployeeProfile>;
    findByEmployeeId(employeeId: string): Promise<EmployeeProfile>;
    findByUserId(userId: number): Promise<EmployeeProfile>;
    update(id: number, updateEmployeeProfileDto: UpdateEmployeeProfileDto): Promise<EmployeeProfile>;
    remove(id: number): Promise<void>;
}
