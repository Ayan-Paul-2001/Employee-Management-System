// src/report/report.controller.ts
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { FilterReportDto } from './dto/filter-report.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/role/role.decorator';
import { UserRole } from 'src/auth/role/role';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('notices')
  @Role(UserRole.ADMIN)
  async getReport(@Query() query: FilterReportDto, @Res() res: Response) {
    const data = await this.reportService.filterReports(query, res);

    if (query.exportFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=notice_report.csv');
      return res.send(data);
    }

    if (query.exportFormat === 'pdf') return; // already streamed

    return res.json(data);
  }
}
