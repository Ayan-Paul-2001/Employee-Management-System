import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { LeaveStatus } from '../common/enums/leave-status.enum';

@ApiTags('leave')
@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveService.create(createLeaveRequestDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get all leave requests (Admin/HR only)' })
  findAll() {
    return this.leaveService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leave requests by employee ID' })
  findByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployeeId(employeeId);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get pending leave requests (Admin/HR only)' })
  findPendingRequests() {
    return this.leaveService.findPendingRequests();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update leave request status (Admin/HR only)' })
  update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Request() req,
  ) {
    return this.leaveService.update(+id, updateLeaveRequestDto, req.user.id);
  }
  
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Approve leave request (Admin/HR only)' })
  approve(
    @Param('id') id: string,
    @Request() req,
  ) {
    const updateDto = { status: LeaveStatus.APPROVED };
    return this.leaveService.update(+id, updateDto, req.user.id);
  }
  
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Reject leave request (Admin/HR only)' })
  reject(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const updateDto = { status: LeaveStatus.REJECTED, rejectionReason: body.reason };
    return this.leaveService.update(+id, updateDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete leave request (Admin/HR only)' })
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}