import { jsPDF } from 'jspdf';
import type { HrAnalyticsResponse } from './types';

function renderPieChartDataUrl(
  present: number,
  absent: number,
  presentPct: number,
): string {
  const size = 540;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;
  const outerR = 212;
  const innerR = 132;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const total = present + absent;

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#E8E5DD';
    ctx.fill();
  } else {
    const startAngle = -Math.PI / 2;
    const presentAngle = (present / total) * Math.PI * 2;

    if (present > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + presentAngle);
      ctx.closePath();
      ctx.fillStyle = '#0F766E';
      ctx.fill();
    }

    if (absent > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(
        cx,
        cy,
        outerR,
        startAngle + presentAngle,
        startAngle + Math.PI * 2,
      );
      ctx.closePath();
      ctx.fillStyle = '#BE123C';
      ctx.fill();
    }

    if (present > 0 && absent > 0) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(startAngle) * (outerR + 2),
        cy + Math.sin(startAngle) * (outerR + 2),
      );
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(startAngle + presentAngle) * (outerR + 2),
        cy + Math.sin(startAngle + presentAngle) * (outerR + 2),
      );
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0A0D14';
  ctx.font = '700 68px Manrope, "Segoe UI", Arial, sans-serif';
  ctx.fillText(`${presentPct}%`, cx, cy - 12);

  ctx.fillStyle = '#8F6B2E';
  ctx.font = '700 20px Manrope, "Segoe UI", Arial, sans-serif';
  ctx.fillText('ATTENDANCE RATE', cx, cy + 36);

  return canvas.toDataURL('image/png', 1.0);
}

export function downloadAttendancePdfReport(analytics: HrAnalyticsResponse): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;

  // Obsidian Executive Banner
  doc.setFillColor(10, 13, 20);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Champagne Gold hairline rule
  doc.setFillColor(201, 162, 91);
  doc.rect(0, 38, pageWidth, 0.9, 'F');

  // Monogram Mark
  doc.setFillColor(20, 25, 38);
  doc.setDrawColor(201, 162, 91);
  doc.roundedRect(margin, 9, 14, 14, 3, 3, 'FD');
  doc.setTextColor(234, 211, 161);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('NH', margin + 7, 17.8, { align: 'center' });

  doc.setTextColor(250, 248, 245);
  doc.setFontSize(16);
  doc.text('Next Hunt Management System', margin + 19, 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(201, 162, 91);
  doc.text('EXECUTIVE HR ATTENDANCE ANALYTICS REPORT', margin + 19, 22);

  doc.setTextColor(180, 186, 198);
  doc.setFontSize(8.5);
  doc.text(`Period: ${analytics.period.toUpperCase()} (${analytics.dateLabel})`, pageWidth - margin, 14.5, {
    align: 'right',
  });
  doc.text(
    `Generated: ${new Date(analytics.generatedAt).toLocaleString()}`,
    pageWidth - margin,
    20.5,
    { align: 'right' },
  );

  // KPI Cards Row
  const kpiY = 46;
  const cardGap = 4;
  const cardW = (pageWidth - margin * 2 - cardGap * 3) / 4;
  const kpis = [
    {
      label: 'TRACKED STAFF',
      value: String(analytics.summary.totalStaff),
      sub: 'Employees & Admins',
      color: [201, 162, 91] as [number, number, number],
    },
    {
      label: 'PRESENT',
      value: `${analytics.summary.present}`,
      sub: `${analytics.summary.presentPercentage}% attendance`,
      color: [15, 118, 110] as [number, number, number],
    },
    {
      label: 'ABSENT',
      value: `${analytics.summary.absent}`,
      sub: `${analytics.summary.absentPercentage}% absence`,
      color: [190, 18, 60] as [number, number, number],
    },
    {
      label: 'ON LEAVE / LATE',
      value: `${analytics.summary.onLeave} / ${analytics.summary.late}`,
      sub: 'Leave & late entries',
      color: [180, 83, 9] as [number, number, number],
    },
  ];

  kpis.forEach((k, idx) => {
    const x = margin + idx * (cardW + cardGap);
    doc.setFillColor(246, 245, 241);
    doc.setDrawColor(232, 229, 221);
    doc.roundedRect(x, kpiY, cardW, 22, 2.5, 2.5, 'FD');

    doc.setFillColor(k.color[0], k.color[1], k.color[2]);
    doc.rect(x, kpiY + 3, 1.5, 16, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(107, 110, 118);
    doc.text(k.label, x + 4.5, kpiY + 6.5);

    doc.setFontSize(14);
    doc.setTextColor(17, 19, 24);
    doc.text(k.value, x + 4.5, kpiY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 110, 118);
    doc.text(k.sub, x + 4.5, kpiY + 19.2);
  });

  // Pie Chart Card
  const chartSectionY = 75;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(232, 229, 221);
  doc.roundedRect(margin, chartSectionY, pageWidth - margin * 2, 76, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 19, 24);
  doc.text('Attendance Distribution (Present vs. Absent)', margin + 6, chartSectionY + 9);

  const pieImg = renderPieChartDataUrl(
    analytics.summary.present,
    analytics.summary.absent,
    analytics.summary.presentPercentage,
  );
  if (pieImg) {
    doc.addImage(pieImg, 'PNG', margin + 12, chartSectionY + 13, 56, 56);
  }

  const legendX = margin + 84;
  let ly = chartSectionY + 24;

  const legendItems = [
    {
      label: 'Present',
      count: analytics.summary.present,
      pct: analytics.summary.presentPercentage,
      rgb: [15, 118, 110] as [number, number, number],
    },
    {
      label: 'Absent',
      count: analytics.summary.absent,
      pct: analytics.summary.absentPercentage,
      rgb: [190, 18, 60] as [number, number, number],
    },
  ];

  legendItems.forEach((item) => {
    doc.setFillColor(item.rgb[0], item.rgb[1], item.rgb[2]);
    doc.roundedRect(legendX, ly - 3.5, 4, 4, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 19, 24);
    doc.text(`${item.label}`, legendX + 7, ly);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(78, 81, 89);
    doc.text(
      `${item.count} record(s)  —  ${item.pct}% of tracked total`,
      legendX + 7,
      ly + 5.5,
    );
    ly += 17;
  });

  doc.setDrawColor(232, 229, 221);
  doc.line(legendX, ly - 3, pageWidth - margin - 8, ly - 3);
  doc.setFontSize(8.5);
  doc.setTextColor(107, 110, 118);
  doc.text(
    `Scope: Active Employees & Admins (${analytics.summary.totalStaff} total members)`,
    legendX,
    ly + 3.5,
  );
  doc.text(
    `Portal: 8:30 AM – 5:00 PM (<= 9:10 AM Present, > 9:10 AM Late)  |  ${analytics.dateLabel}`,
    legendX,
    ly + 8.5,
  );

  // Staff Breakdown Table
  let y = chartSectionY + 86;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 19, 24);
  doc.text('Staff Attendance Breakdown', margin, y);
  y += 5;

  const drawTableHeader = (yPos: number) => {
    doc.setFillColor(246, 245, 241);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 110, 118);
    doc.text('CODE', margin + 3, yPos + 5.3);
    doc.text('MEMBER', margin + 22, yPos + 5.3);
    doc.text('ROLE', margin + 74, yPos + 5.3);
    doc.text('DEPARTMENT', margin + 96, yPos + 5.3);
    doc.text('PRESENT / ABSENT', margin + 132, yPos + 5.3);
    doc.text('STATUS', pageWidth - margin - 3, yPos + 5.3, { align: 'right' });
  };

  drawTableHeader(y);
  y += 8;

  analytics.staffBreakdown.forEach((row, index) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 18;
      drawTableHeader(y);
      y += 8;
    }

    if (index % 2 === 1) {
      doc.setFillColor(250, 249, 246);
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(143, 107, 46);
    doc.text(row.employeeCode || '-', margin + 3, y + 5.4);

    doc.setTextColor(17, 19, 24);
    doc.setFont('helvetica', 'bold');
    doc.text(row.fullName.slice(0, 24), margin + 22, y + 5.4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(78, 81, 89);
    doc.text(row.role.toUpperCase(), margin + 74, y + 5.4);
    doc.text((row.department || 'General').slice(0, 18), margin + 96, y + 5.4);
    doc.text(`${row.presentDays}P / ${row.absentDays}A`, margin + 132, y + 5.4);

    const statusUpper = row.status.replace('_', ' ').toUpperCase();
    if (row.status === 'present') doc.setTextColor(15, 118, 110);
    else if (row.status === 'late') doc.setTextColor(180, 83, 9);
    else doc.setTextColor(190, 18, 60);

    doc.setFont('helvetica', 'bold');
    doc.text(statusUpper, pageWidth - margin - 3, y + 5.4, { align: 'right' });
    y += 8;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 145, 138);
  doc.text(
    'Next Hunt Management System — Confidential HR Analytics Export',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' },
  );

  doc.save(`next-hunt-attendance-${analytics.period}-${analytics.endDate}.pdf`);
}
