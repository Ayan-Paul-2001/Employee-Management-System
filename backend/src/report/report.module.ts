// src/report/report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from 'src/notice/entities/notice.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
