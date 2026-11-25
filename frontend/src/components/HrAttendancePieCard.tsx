'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  FileDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { HrAnalyticsResponse } from '@/lib/types';
import { downloadAttendancePdfReport } from '@/lib/pdf-report';
import { RoleBadge, StatusBadge, AvatarCircle } from './Badges';

interface HrAttendancePieCardProps {
  analytics: HrAnalyticsResponse | null;
  loading: boolean;
  period: 'today' | 'week' | 'month';
  selectedDate: string;
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  onDateChange: (date: string) => void;
}

export function HrAttendancePieCard({
  analytics,
  loading,
  period,
  selectedDate,
  onPeriodChange,
  onDateChange,
}: HrAttendancePieCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = () => {
    if (!analytics) return;
    setDownloading(true);
    try {
      downloadAttendancePdfReport(analytics);
      toast.success('Executive Attendance PDF exported.');
    } catch {
      toast.error('Failed to generate PDF report');
    } finally {
      setTimeout(() => setDownloading(false), 300);
    }
  };

  const totalValue =
    (analytics?.summary.present || 0) + (analytics?.summary.absent || 0);

  const chartData =
    totalValue > 0
      ? [
          {
            name: 'Present',
            value: analytics!.summary.present,
            percentage: analytics!.summary.presentPercentage,
            color: '#0F766E',
          },
          {
            name: 'Absent',
            value: analytics!.summary.absent,
            percentage: analytics!.summary.absentPercentage,
            color: '#BE123C',
          },
        ]
      : [{ name: 'No Data', value: 1, percentage: 0, color: '#E8E5DD' }];

  return (
    <div className="space-y-6">
      {/* Main Executive Pie Chart Card */}
      <div className="nh-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#EFECE5] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-heading text-lg font-bold text-[#111318]">
                Workforce Attendance Distribution
              </h2>
              <span className="rounded-full bg-[#FAF3E3] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[#8F6B2E] ring-1 ring-[#E4CFA0]">
                HR Executive View
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6B6E76]">
              Present vs. Absent ratio across active Employees &amp; Admins
              {analytics ? ` • ${analytics.dateLabel}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
              {(
                [
                  { key: 'today', label: 'Daily' },
                  { key: 'week', label: '7 Days' },
                  { key: 'month', label: '30 Days' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onPeriodChange(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    period === tab.key
                      ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                      : 'text-[#6B6E76] hover:text-[#111318]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {period === 'today' && (
              <div className="nh-field-box !w-auto !py-0 !px-3">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-[#8B8982]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="bg-transparent py-1.5 font-mono text-xs font-semibold text-[#111318] outline-none"
                />
              </div>
            )}

            <button
              type="button"
              disabled={!analytics || loading || downloading}
              onClick={handleDownloadPdf}
              className="nh-btn-primary px-4 py-2 text-xs"
            >
              {downloading ? (
                <FileDown className="h-3.5 w-3.5 animate-bounce text-[#EAD3A1]" />
              ) : (
                <Download className="h-3.5 w-3.5 text-[#EAD3A1]" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:items-center">
          {/* Interactive Donut Pie Chart */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-5">
            {loading || !analytics ? (
              <div className="flex h-64 w-64 items-center justify-center rounded-full border-8 border-[#F0EDE6]">
                <span className="text-xs font-medium text-[#8E919A]">
                  Loading analytics...
                </span>
              </div>
            ) : (
              <div className="relative h-72 w-full max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={76}
                      outerRadius={114}
                      paddingAngle={totalValue > 0 ? 3 : 0}
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      animationDuration={260}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`slice-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload;
                        if (item.name === 'No Data') return null;
                        return (
                          <div className="rounded-xl border border-[#C9A25B]/30 bg-[#0A0D14] px-3.5 py-2.5 text-xs text-[#FAF8F5] shadow-xl">
                            <div className="flex items-center gap-2 font-bold">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </div>
                            <p className="mt-1 font-mono text-[#C5C8D1]">
                              {item.value} record(s) ({item.percentage}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Readout */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-4xl font-bold text-[#111318] tabular-nums">
                    {analytics.summary.presentPercentage}%
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F6B2E]">
                    Present Rate
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Refined Metric Breakdown Cards */}
          <div className="space-y-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#CBE7DE] bg-[#F2FBF8] p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0D6A4E]">
                    <CheckCircle2 className="h-4 w-4 text-[#0F766E]" />
                    Present
                  </span>
                  <span className="rounded-full bg-[#DCF4EC] px-2.5 py-0.5 font-mono text-xs font-bold text-[#0D6A4E]">
                    {analytics?.summary.presentPercentage ?? 0}%
                  </span>
                </div>
                <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
                  {analytics?.summary.present ?? 0}
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#D5EFE6]">
                  <div
                    className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                    style={{
                      width: `${analytics?.summary.presentPercentage ?? 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-[#2D6E5C]">
                  Includes {analytics?.summary.late ?? 0} late check-in(s)
                </p>
              </div>

              <div className="rounded-2xl border border-[#F3CCD5] bg-[#FEF4F6] p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9F1239]">
                    <XCircle className="h-4 w-4 text-[#BE123C]" />
                    Absent
                  </span>
                  <span className="rounded-full bg-[#FCE3E9] px-2.5 py-0.5 font-mono text-xs font-bold text-[#9F1239]">
                    {analytics?.summary.absentPercentage ?? 0}%
                  </span>
                </div>
                <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
                  {analytics?.summary.absent ?? 0}
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F7D7DF]">
                  <div
                    className="h-full rounded-full bg-[#BE123C] transition-all duration-500"
                    style={{
                      width: `${analytics?.summary.absentPercentage ?? 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-[#9F3652]">
                  Includes {analytics?.summary.onLeave ?? 0} on approved leave
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EAE7DF] bg-[#FAF9F5] px-4 py-3 text-xs text-[#5C5F66]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#9A7432]" />
                <span>
                  Tracking{' '}
                  <strong className="font-mono text-[#111318]">
                    {analytics?.summary.totalStaff ?? 0}
                  </strong>{' '}
                  active staff members (Employees &amp; Admins)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#7D8088]">
                <Clock className="h-3.5 w-3.5 text-[#9A7432]" />
                <span>Portal: 8:30 AM – 5:00 PM (≤ 9:10 AM Present) • PDF ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Breakdown Table */}
      {analytics && (
        <div className="nh-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#111318]">
                Staff Attendance Breakdown
              </h3>
              <p className="text-xs text-[#73767E]">
                Detailed roster synchronized with your PDF export
              </p>
            </div>
            <span className="rounded-lg bg-[#F4F2EC] px-2.5 py-1 font-mono text-xs font-semibold text-[#42454D]">
              {analytics.staffBreakdown.length} members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFECE5] bg-[#FAF9F5] text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Check-In</th>
                  <th className="px-4 py-3.5">Check-Out</th>
                  <th className="px-4 py-3.5">Summary</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE8]">
                {analytics.staffBreakdown.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-[#73767E]"
                    >
                      No active employees or admins found yet.
                    </td>
                  </tr>
                ) : (
                  analytics.staffBreakdown.map((row) => (
                    <tr
                      key={row.id}
                      className="transition hover:bg-[#FAF9F5]"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <AvatarCircle
                            name={row.fullName}
                            role={row.role}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-[#111318]">
                              {row.fullName}
                            </p>
                            <p className="font-mono text-[11px] text-[#7D8088]">
                              {row.employeeCode} • {row.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={row.role} />
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-[#52555E]">
                        {row.department}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#2C2F36] tabular-nums">
                        {row.checkInTime
                          ? new Date(row.checkInTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#2C2F36] tabular-nums">
                        {row.checkOutTime
                          ? new Date(row.checkOutTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">
                        <span className="font-bold text-[#0F766E]">
                          {row.presentDays}P
                        </span>
                        <span className="mx-1 text-[#D0CCC2]">/</span>
                        <span className="font-bold text-[#BE123C]">
                          {row.absentDays}A
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
