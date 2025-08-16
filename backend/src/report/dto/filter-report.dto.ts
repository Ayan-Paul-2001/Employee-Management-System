// src/report/dto/filter-report.dto.ts
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FilterReportDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  adminName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  exportFormat?: 'csv' | 'pdf';

  @IsOptional()
  @IsNumberString()
  page?: string; // string because query params come in as strings

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
