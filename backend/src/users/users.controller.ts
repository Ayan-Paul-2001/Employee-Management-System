import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { RejectApplicantDto } from './dto/reject-applicant.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApprovedUserGuard } from '../common/guards/approved-user.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, ApprovedUserGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all approved team members (HR & Admin)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('stats')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get headcount & applicant summary (HR & Admin)' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get('applicants')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get pending & rejected employment applicants (HR & Admin)' })
  findApplicants(@Query('status') status?: string) {
    return this.usersService.findApplicants(status || 'all');
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateOwnProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch(':id/approve')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Approve a pending employment applicant (HR & Admin)' })
  approveApplicant(@Param('id') id: string, @Request() req) {
    return this.usersService.approveApplicant(id, req.user);
  }

  @Patch(':id/reject')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Reject a pending employment applicant (HR & Admin)' })
  rejectApplicant(
    @Param('id') id: string,
    @Body() dto: RejectApplicantDto,
    @Request() req,
  ) {
    return this.usersService.rejectApplicant(id, req.user, dto?.reason);
  }

  @Get(':id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (HR & Admin)' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return user.toJSON();
  }

  @Patch(':id/role')
  @Roles(Role.HR) // Strictly HR ONLY — Admin cannot upgrade/change roles!
  @ApiOperation({ summary: 'Upgrade/change user role (HR Super Admin ONLY)' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.usersService.updateRole(id, dto, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.HR)
  @ApiOperation({ summary: 'Update member details (HR ONLY)' })
  updateMember(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @Delete(':id')
  @Roles(Role.HR)
  @ApiOperation({ summary: 'Remove user account (HR ONLY)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.id);
  }
}
