import { Controller, Post, Get, Patch, UseGuards, Body, Param } from '@nestjs/common';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { LeaveApprovalDto } from './dto/leave-approval.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
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

  @Get('employees')
  getAllEmployees() {
    return this.hrService.getAllEmployees();
  }

  @Patch('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return this.hrService.updateEmployee(+id, updateDto);
  }

  @Get('leave-requests')
  getLeaveRequests() {
    return this.hrService.getAllLeaveRequests();
  }

  @Patch('leave-requests/:id')
  approveLeave(@Param('id') id: string, @Body() approvalDto: LeaveApprovalDto) {
    return this.hrService.approveOrRejectLeave(+id, approvalDto);
  }

  @Post('reviews')
  addReview(@Body() reviewDto: CreateReviewDto) {
    return this.hrService.addPerformanceReview(reviewDto);
  }

  @Get('reviews/:employeeId')
  getEmployeeReviews(@Param('employeeId') employeeId: string) {
    return this.hrService.getEmployeeReviews(+employeeId);
  }

  @Post('announcements')
  postAnnouncement(@Body() announcementDto: CreateAnnouncementDto) {
    return this.hrService.postAnnouncement(announcementDto);
  }

  @Get('announcements')
  getAnnouncements() {
    return this.hrService.getAllAnnouncements();
  }

  @Post('employees')
  onboardEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.hrService.onboardEmployee(createEmployeeDto);
  }
}