import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum.js';

export class UpdateRoleDto {
  @ApiProperty({ enum: [Role.ADMIN, Role.EMPLOYEE], example: Role.ADMIN })
  @IsNotEmpty()
  @IsIn([Role.ADMIN, Role.EMPLOYEE], {
    message: 'Role must be either "admin" or "employee"',
  })
  role: Role.ADMIN | Role.EMPLOYEE;
}
