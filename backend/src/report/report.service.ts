// src/report/report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from 'src/notice/entities/notice.entity';
import { Repository } from 'typeorm';
import { FilterReportDto } from './dto/filter-report.dto';
import { Response } from 'express';
import { Parser } from 'json2csv';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
  ) {}

  async filterReports(dto: FilterReportDto, res?: Response) {
    const query = this.noticeRepo.createQueryBuilder('notice');

    if (dto.adminName) {
      query.andWhere('notice.adminName = :adminName', { adminName: dto.adminName });
    }

    if (dto.type) {
      query.andWhere('notice.type = :type', { type: dto.type });
    }

    if (dto.startDate && dto.endDate) {
      query.andWhere('notice.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });
    }

    // Export cases (skip pagination)
    if (dto.exportFormat === 'csv') {
      const results = await query.getMany();
      const fields = ['id', 'adminName', 'type', 'message', 'createdAt'];
      const parser = new Parser({ fields });
      return parser.parse(results);
    }

    if (dto.exportFormat === 'pdf' && res) {
      const results = await query.getMany();
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=notice_report.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('Notice Report', { align: 'center' }).moveDown();

      results.forEach((notice, i) => {
        doc.fontSize(12).text(
          `${i + 1}. Admin: ${notice.adminName}
Type: ${notice.type}
Message: ${notice.message}
Date: ${new Date(notice.createdAt).toLocaleDateString()}`,
          { paragraphGap: 10 }
        ).moveDown();
      });

      doc.end();
      return;
    }

    // ✅ Pagination
    const page = parseInt(dto.page ?? '1', 10);
    const limit = parseInt(dto.limit ?? '10', 10);

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('notice.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
