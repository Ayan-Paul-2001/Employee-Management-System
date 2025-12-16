import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.HR })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}