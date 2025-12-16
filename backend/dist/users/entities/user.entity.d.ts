import { Role } from '../../common/enums/role.enum';
import { EmployeeProfile } from '../../employees/entities/employee-profile.entity';
export declare class User {
    id: number;
    fullName: string;
    email: string;
    passwordHash: string;
    role: Role;
    employeeProfile: EmployeeProfile;
    createdAt: Date;
    updatedAt: Date;
}
