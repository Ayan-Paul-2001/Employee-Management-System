import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create employee profile (Admin/HR only)' })
  @ApiResponse({ status: 201, description: 'Employee profile created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createEmployeeProfileDto: CreateEmployeeProfileDto) {
    console.log('Received create employee request:', createEmployeeProfileDto);
    return this.employeesService.create(createEmployeeProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employee profiles' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get employee profile by user ID' })
  async findByUserId(@Param('userId') userId: string) {
    try {
      return await this.employeesService.findByUserId(+userId);
    } catch (error) {
      throw error;
    }
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get employee profile by ID' })
  async findOne(@Param('id') id: string) {
    try {
      // Add a small delay to simulate network latency and stabilize frontend loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      return await this.employeesService.findOne(+id);
    } catch (error) {
      // Ensure consistent error response format
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update employee profile (Admin/HR only)' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeProfileDto: UpdateEmployeeProfileDto,
  ) {
    return this.employeesService.update(+id, updateEmployeeProfileDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete employee profile (Admin/HR only)' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}