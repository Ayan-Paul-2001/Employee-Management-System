import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service.js';
import { CreateLeaveRequestDto, ReviewLeaveDto } from './dto/leave.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApprovedUserGuard } from '../common/guards/approved-user.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { LeaveStatus } from '../common/enums/leave-status.enum.js';

@ApiTags('leave')
@ApiBearerAuth()
@Controller('leave')
@UseGuards(JwtAuthGuard, ApprovedUserGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Apply for leave (Employee & Admin only — HR does not apply)' })
  create(@Request() req, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.create(req.user.id, dto);
  }

  @Get('me')
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @ApiOperation({ summary: 'Get authenticated Employee/Admin leave applications' })
  findMine(@Request() req) {
    return this.leaveService.findMine(req.user.id);
  }

  @Get()
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all leave applications (HR & Admin)' })
  findAll(@Query('status') status?: string) {
    return this.leaveService.findAll(status);
  }

  @Patch(':id/approve')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Approve leave application (HR & Admin)' })
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
    @Request() req,
  ) {
    return this.leaveService.review(id, LeaveStatus.APPROVED, req.user, dto);
  }

  @Patch(':id/reject')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Reject leave application (HR & Admin)' })
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
    @Request() req,
  ) {
    return this.leaveService.review(id, LeaveStatus.REJECTED, req.user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel pending leave request or delete (HR & Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.leaveService.remove(id, req.user);
  }
}
