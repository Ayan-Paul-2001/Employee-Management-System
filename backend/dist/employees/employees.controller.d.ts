import { EmployeesService } from './employees.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeProfileDto: CreateEmployeeProfileDto): Promise<import("./entities/employee-profile.entity").EmployeeProfile>;
    findAll(): Promise<import("./entities/employee-profile.entity").EmployeeProfile[]>;
    findByUserId(userId: string): Promise<import("./entities/employee-profile.entity").EmployeeProfile>;
    findOne(id: string): Promise<import("./entities/employee-profile.entity").EmployeeProfile>;
    update(id: string, updateEmployeeProfileDto: UpdateEmployeeProfileDto): Promise<import("./entities/employee-profile.entity").EmployeeProfile>;
    remove(id: string): Promise<void>;
}
