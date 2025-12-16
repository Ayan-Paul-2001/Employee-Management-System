import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEmployeeProfileDto } from './create-employee-profile.dto';

export class UpdateEmployeeProfileDto extends PartialType(
  OmitType(CreateEmployeeProfileDto, ['userId'] as const),
) {}