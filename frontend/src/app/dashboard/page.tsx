'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Users,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Megaphone,
  ArrowUpRight,
  Clock,
  Pin,
  Crown,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import {
  getCached,
  setCached,
  invalidateCache,
  seedCachesFromOverview,
  getTodayDateKey,
} from '@/lib/cache';
import type {
  AttendanceRecord,
  HrAnalyticsResponse,
  LeaveRequestItem,
  NoticeItem,
} from '@/lib/types';
import { HrAttendancePieCard } from '@/components/HrAttendancePieCard';
import { AttendancePunchCard } from '@/components/AttendancePunchCard';
import { StatusBadge, AvatarCircle, RoleBadge } from '@/components/Badges';

interface OverviewPayload {
  role: string;
  stats?: {
    total: number;
    hr: number;
    admin: number;
    employee: number;
    trackedStaff: number;
    pendingApplicants?: number;
    rejectedApplicants?: number;
  };
  analytics?: HrAnalyticsResponse;
  myAttendance?: {
    today: AttendanceRecord | null;
    records: AttendanceRecord[];
  };
  leaves: LeaveRequestItem[];
  notices: NoticeItem[];
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey);

  const initialOverview = user
    ? getCached<OverviewPayload>(`${user.id}:overview:today:${getTodayDateKey()}`)
    : null;

  const [analytics, setAnalytics] = useState<HrAnalyticsResponse | null>(
    initialOverview?.analytics || null,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [myTodayAttendance, setMyTodayAttendance] =
    useState<AttendanceRecord | null>(initialOverview?.myAttendance?.today || null);
  const [myAttendanceRecords, setMyAttendanceRecords] = useState<
    AttendanceRecord[]
  >(initialOverview?.myAttendance?.records || []);
  const [teamStats, setTeamStats] = useState<OverviewPayload['stats'] | null>(
    initialOverview?.stats || null,
  );
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>(
    initialOverview?.leaves || [],
  );
  const [notices, setNotices] = useState<NoticeItem[]>(
    initialOverview?.notices || [],
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const initialFetchedRef = useRef(false);

  const applyOverviewPayload = useCallback((data: OverviewPayload) => {
    if (data.stats) setTeamStats(data.stats);
    if (data.analytics) setAnalytics(data.analytics);
    if (data.myAttendance) {
      setMyTodayAttendance(data.myAttendance.today);
      setMyAttendanceRecords(data.myAttendance.records || []);
    }
    setLeaves(data.leaves || []);
    setNotices(data.notices || []);
  }, []);

  // Single batched HTTP round-trip for entire Overview page + instant SWR cache
  const fetchOverview = useCallback(
    async (opts?: { forceFresh?: boolean }) => {
      if (!user) return;
      const cacheKey = `${user.id}:overview:${period}:${selectedDate}`;
      if (!opts?.forceFresh) {
        const cached = getCached<OverviewPayload>(cacheKey);
        if (cached) {
          applyOverviewPayload(cached);
        } else if (user.role === 'hr' && !analytics) {
          setAnalyticsLoading(true);
        }
      }

      try {
        const params: Record<string, string> = { period };
        if (period === 'today' && selectedDate) params.date = selectedDate;
        const res = await api.get<OverviewPayload>('/dashboard/overview', {
          params,
        });
        applyOverviewPayload(res.data);
        setCached(cacheKey, res.data);
        seedCachesFromOverview(user, res.data);
      } catch {} finally {
        setAnalyticsLoading(false);
      }
    },
    [user, period, selectedDate, applyOverviewPayload, analytics],
  );

  // Fast dedicated analytics refresh when HR switches Daily / 7 Days / 30 Days or date
  const fetchPeriodAnalyticsOnly = useCallback(async () => {
    if (!user || user.role !== 'hr') return;
    const cacheKey = `${user.id}:analytics:${period}:${selectedDate}`;
    const cached = getCached<HrAnalyticsResponse>(cacheKey);
    if (cached) {
      setAnalytics(cached);
    } else {
      setAnalyticsLoading(true);
    }
    try {
      const params: Record<string, string> = { period };
      if (period === 'today' && selectedDate) params.date = selectedDate;
      const res = await api.get<HrAnalyticsResponse>('/attendance/analytics', {
        params,
      });
      setAnalytics(res.data);
      setCached(cacheKey, res.data);
    } catch {} finally {
      setAnalyticsLoading(false);
    }
  }, [user, period, selectedDate]);

  useEffect(() => {
    if (!user) return;
    if (!initialFetchedRef.current) {
      initialFetchedRef.current = true;
      fetchOverview();
    } else {
      fetchPeriodAnalyticsOnly();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, period, selectedDate]);

  const handleQuickLeaveAction = async (
    id: string,
    action: 'approve' | 'reject',
  ) => {
    setReviewingId(id);
    try {
      await api.patch(`/leave/${id}/${action}`, {});
      toast.success(
        `Leave application ${action === 'approve' ? 'approved' : 'rejected'}.`,
      );
      invalidateCache('overview');
      invalidateCache('leaves');
      invalidateCache('analytics');
      await fetchOverview({ forceFresh: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to ${action} leave`));
    } finally {
      setReviewingId(null);
    }
  };

  if (!user) return null;

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'approved');
  const greetingTime =
    new Date().getHours() < 12
      ? 'Morning'
      : new Date().getHours() < 18
        ? 'Afternoon'
        : 'Evening';

  return (
    <div className="space-y-7">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A7432]">
            {user.role === 'hr'
              ? 'HR Super Admin Suite'
              : user.role === 'admin'
                ? 'Admin Operations Hub'
                : 'Employee Workspace'}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-[#111318] sm:text-3xl">
            Good {greetingTime},{' '}
            <span className="font-editorial font-normal italic text-[#5C4924]">
              {user.fullName.split(' ')[0]}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user.role === 'hr' && (
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-2 rounded-xl border border-[#DFDCD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#111318] shadow-2xs transition hover:border-[#C9A25B]/60 hover:bg-[#FAF9F5]"
            >
              <Crown className="h-3.5 w-3.5 text-[#B68938]" />
              Manage Roles
            </Link>
          )}
          {(user.role === 'hr' || user.role === 'admin') && (
            <Link
              href="/dashboard/notices"
              className="nh-btn-primary px-4 py-2.5 text-xs"
            >
              <Megaphone className="h-3.5 w-3.5 text-[#EAD3A1]" />
              Publish Notice
            </Link>
          )}
          {user.role === 'employee' && (
            <Link
              href="/dashboard/leaves"
              className="nh-btn-primary px-4 py-2.5 text-xs"
            >
              <CalendarClock className="h-3.5 w-3.5 text-[#EAD3A1]" />
              Apply for Leave
            </Link>
          )}
        </div>
      </div>

      {/* Pending Employment Applicants Alert Strip (HR & Admin) */}
      {(user.role === 'hr' || user.role === 'admin') &&
        (teamStats?.pendingApplicants ?? 0) > 0 && (
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E4CFA0] bg-[#FDF9EE] px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A0D14] text-[#EAD3A1]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111318]">
                  {teamStats?.pendingApplicants} New Employment Applicant
                  {(teamStats?.pendingApplicants ?? 0) > 1 ? 's' : ''} Waiting
                  in Lobby
                </p>
                <p className="text-xs text-[#6E5629]">
                  Review pending sign-ups and approve or reject workspace access.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/approvals"
              className="nh-btn-primary shrink-0 px-4 py-2 text-xs"
            >
              Review Applicants
              <ArrowUpRight className="h-3.5 w-3.5 text-[#EAD3A1]" />
            </Link>
          </div>
        )}

      {/* Employee & Admin Daily Check-In/Out Hero */}
      {(user.role === 'employee' || user.role === 'admin') && (
        <AttendancePunchCard
          todayRecord={myTodayAttendance}
          onUpdated={() => {
            invalidateCache('overview');
            invalidateCache('attendance');
            fetchOverview({ forceFresh: true });
          }}
          roleLabel={
            user.role === 'admin' ? 'Admin Attendance' : 'Employee Attendance'
          }
        />
      )}

      {/* KPI Metrics Strip */}
      {user.role === 'hr' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Tracked Staff
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E3] text-[#9A7432]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {teamStats?.trackedStaff ?? analytics?.summary.totalStaff ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              {teamStats?.admin ?? 0} Admin(s) • {teamStats?.employee ?? 0} Employee(s)
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Present ({period})
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECF8F3] text-[#0F766E]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#0F766E] tabular-nums">
              {analytics?.summary.present ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              {analytics?.summary.presentPercentage ?? 0}% attendance rate
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Absent ({period})
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF1F3] text-[#BE123C]">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#BE123C] tabular-nums">
              {analytics?.summary.absent ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              {analytics?.summary.absentPercentage ?? 0}% absence rate
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Pending Leaves
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF4E4] text-[#B45309]">
                <CalendarClock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {pendingLeaves.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              Awaiting HR or Admin review
            </p>
          </div>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Team Members
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E3] text-[#9A7432]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {teamStats?.total ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              {teamStats?.employee ?? 0} active employees
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Pending Leaves
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF4E4] text-[#B45309]">
                <CalendarClock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {pendingLeaves.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">Ready for decision</p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Active Notices
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F1EC] text-[#42454D]">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {notices.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">Published announcements</p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                My Days Logged
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECF8F3] text-[#0F766E]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {myAttendanceRecords.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              {myTodayAttendance ? 'Checked in today' : 'Not checked in yet'}
            </p>
          </div>
        </div>
      )}

      {user.role === 'employee' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Today&apos;s Status
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECF8F3] text-[#0F766E]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <StatusBadge status={myTodayAttendance?.status || 'absent'} />
            </div>
            <p className="mt-2 text-xs text-[#73767E]">
              {myTodayAttendance?.checkInTime
                ? `In at ${new Date(myTodayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Use Check In above'}
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Total Attendance
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E3] text-[#9A7432]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {myAttendanceRecords.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">Recorded shifts</p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Leave Requests
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF4E4] text-[#B45309]">
                <CalendarClock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {pendingLeaves.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">
              Pending • {approvedLeaves.length} approved
            </p>
          </div>

          <div className="nh-card nh-card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                Official Notices
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F1EC] text-[#42454D]">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-[#111318] tabular-nums">
              {notices.length}
            </p>
            <p className="mt-1 text-xs text-[#73767E]">Active announcements</p>
          </div>
        </div>
      )}

      {/* HR Flagship Attendance Pie Chart + PDF Export */}
      {user.role === 'hr' && (
        <HrAttendancePieCard
          analytics={analytics}
          loading={analyticsLoading}
          period={period}
          selectedDate={selectedDate}
          onPeriodChange={setPeriod}
          onDateChange={setSelectedDate}
        />
      )}

      {/* Bottom 2-Column Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="nh-card flex flex-col lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#111318]">
                {user.role === 'employee'
                  ? 'My Leave Applications'
                  : 'Pending Leave Queue'}
              </h3>
              <p className="text-xs text-[#73767E]">
                {user.role === 'employee'
                  ? 'Track approval status from Admin & HR'
                  : 'Quickly approve or decline employee leave requests'}
              </p>
            </div>
            <Link
              href="/dashboard/leaves"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#9A7432] hover:text-[#6E501D]"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#F2EFE8]">
            {(user.role === 'employee'
              ? leaves.slice(0, 5)
              : pendingLeaves.slice(0, 5)
            ).length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarClock className="mx-auto mb-2 h-8 w-8 text-[#D5D1C7]" />
                <p className="text-sm font-semibold text-[#52555E]">
                  {user.role === 'employee'
                    ? 'No leave applications yet'
                    : 'All leave applications reviewed'}
                </p>
                <p className="mt-0.5 text-xs text-[#8E919A]">
                  {user.role === 'employee'
                    ? 'Submit a request anytime from Leave Requests.'
                    : 'New requests will appear here immediately.'}
                </p>
              </div>
            ) : (
              (user.role === 'employee'
                ? leaves.slice(0, 5)
                : pendingLeaves.slice(0, 5)
              ).map((lv) => (
                <div
                  key={lv.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    {lv.applicant && (
                      <AvatarCircle
                        name={lv.applicant.fullName}
                        role={lv.applicant.role}
                        size="sm"
                      />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#111318]">
                          {user.role === 'employee'
                            ? `${lv.leaveType.toUpperCase()} Leave`
                            : lv.applicant?.fullName || 'Team Member'}
                        </p>
                        {user.role !== 'employee' && lv.applicant && (
                          <RoleBadge role={lv.applicant.role} />
                        )}
                        <span className="rounded-md bg-[#F4F2EC] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#52555E]">
                          {lv.days}d • {lv.leaveType}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#5C5F66] line-clamp-1">
                        {lv.reason}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#8E919A]">
                        {new Date(lv.fromDate).toLocaleDateString()} —{' '}
                        {new Date(lv.toDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user.role === 'employee' ? (
                    <StatusBadge status={lv.status} />
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={reviewingId === lv.id}
                        onClick={() => handleQuickLeaveAction(lv.id, 'approve')}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0D625C] disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={reviewingId === lv.id}
                        onClick={() => handleQuickLeaveAction(lv.id, 'reject')}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#F3CCD5] bg-[#FDF1F3] px-3 py-1.5 text-xs font-semibold text-[#9F1239] transition hover:bg-[#FCE2E8] disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Official Notices */}
        <div className="nh-card flex flex-col lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#111318]">
                Official Notice Board
              </h3>
              <p className="text-xs text-[#73767E]">
                Announcements from HR &amp; Admin
              </p>
            </div>
            <Link
              href="/dashboard/notices"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#9A7432] hover:text-[#6E501D]"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#F2EFE8]">
            {notices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Megaphone className="mx-auto mb-2 h-8 w-8 text-[#D5D1C7]" />
                <p className="text-sm font-medium text-[#52555E]">
                  No notices published yet
                </p>
              </div>
            ) : (
              notices.slice(0, 4).map((notice) => (
                <div key={notice.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {notice.pinned && (
                        <Pin className="h-3.5 w-3.5 shrink-0 text-[#B68938]" />
                      )}
                      <h4 className="text-sm font-bold text-[#111318] line-clamp-1">
                        {notice.title}
                      </h4>
                    </div>
                    <StatusBadge status={notice.priority} />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5C5F66] line-clamp-2">
                    {notice.content}
                  </p>
                  <p className="mt-2 text-[11px] text-[#8E919A]">
                    Published by{' '}
                    <span className="font-semibold text-[#42454D]">
                      {notice.author?.fullName || 'Management'}
                    </span>{' '}
                    • {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
