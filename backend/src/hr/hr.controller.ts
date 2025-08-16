import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role/role.decorator';
import { UserRole } from '../auth/role/role';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role(UserRole.HR_MANAGER)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('employees')
  onboardEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.hrService.onboardEmployee(createEmployeeDto);
  }
}