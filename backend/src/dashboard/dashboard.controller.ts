import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovedUserGuard } from '../common/guards/approved-user.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, ApprovedUserGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Batched single-round-trip overview payload for HR, Admin, or Employee',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiQuery({ name: 'date', required: false, type: String })
  getOverview(
    @Request() req,
    @Query('period') period = 'today',
    @Query('date') date?: string,
  ) {
    return this.dashboardService.getOverview(req.user, period, date);
  }
}
