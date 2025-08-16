import { Controller, Post, Get, Param, Delete, Body, Patch, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role/role.decorator';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeaveDto } from '../leave/dto/create-leave.dto';
import { CreateAttendanceDto } from '../attendance/dto/create-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post('create')
  @Role('admin')
  create(@Body() dto: CreateEmployeeDto, @Req() req: Request) {
    const currentUser = req.user;
    console.log('Current Admin:', currentUser);
    return this.employeeService.create(dto);
  }

  @Get('all')
  @Role('admin') 
  findAll(@Req() req: Request) {
    const currentUser = req.user;
    console.log('Current Admin:', currentUser);
    return this.employeeService.findAll();
  }

  @Get(':id')
  @Role('admin') 
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user;
    console.log('Current Admin:', currentUser);
    return this.employeeService.findOne(id);
  }

  @Patch('update/:id')
  @Role('admin') 
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto, @Req() req: Request) {
    const currentUser = req.user;
    console.log('Current Admin:', currentUser);
    return this.employeeService.update(id, dto);
  }

  @Delete('delete/:id')
  @Role('admin') 
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user;
    console.log('Current Admin:', currentUser);
    return this.employeeService.remove(id);
  }

  @Post('leave')
  @UseGuards(AuthGuard('jwt'))
  async requestLeave(@Req() req, @Body() createLeaveDto: CreateLeaveDto) {
    return this.employeeService.requestLeave(req.user.id, createLeaveDto);
  }

  @Post('attendance')
  @UseGuards(AuthGuard('jwt'))
  async recordAttendance(@Req() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    return this.employeeService.recordAttendance(req.user.id, createAttendanceDto);
  }
}
