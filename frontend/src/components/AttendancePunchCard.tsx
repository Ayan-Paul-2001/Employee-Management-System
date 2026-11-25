'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Sparkles,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import type { AttendanceRecord } from '@/lib/types';
import { StatusBadge } from './Badges';

interface AttendancePunchCardProps {
  todayRecord: AttendanceRecord | null;
  onUpdated: () => void;
  roleLabel?: string;
}

const PORTAL_OPEN_MINUTES = 8 * 60 + 30; // 8:30 AM
const PRESENT_CUTOFF_MINUTES = 9 * 60 + 10; // 9:10 AM
const PORTAL_CLOSE_MINUTES = 17 * 60; // 5:00 PM

function getPortalState(now: Date | null): {
  state: 'loading' | 'before_open' | 'present_window' | 'late_window' | 'closed_evening';
  label: string;
  closedMessage: string;
} {
  if (!now) {
    return {
      state: 'loading',
      label: 'Portal: 8:30 AM – 5:00 PM',
      closedMessage: '',
    };
  }
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < PORTAL_OPEN_MINUTES) {
    return {
      state: 'before_open',
      label: 'Portal Closed • Opens at 8:30 AM',
      closedMessage:
        'Attendance portal opens at 8:30 AM. Check in by 9:10 AM to be marked Present.',
    };
  }
  if (mins > PORTAL_CLOSE_MINUTES) {
    return {
      state: 'closed_evening',
      label: 'Portal Closed • Reopens 8:30 AM',
      closedMessage:
        'Attendance portal closed at 5:00 PM. It will reopen tomorrow at 8:30 AM.',
    };
  }
  if (mins <= PRESENT_CUTOFF_MINUTES) {
    return {
      state: 'present_window',
      label: 'Portal Open • On-Time (≤ 9:10 AM)',
      closedMessage: '',
    };
  }
  return {
    state: 'late_window',
    label: 'Portal Open • Late Window (After 9:10 AM)',
    closedMessage: '',
  };
}

export function AttendancePunchCard({
  todayRecord,
  onUpdated,
  roleLabel,
}: AttendancePunchCardProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = Boolean(todayRecord?.checkInTime);
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime);
  const portal = getPortalState(now);
  const isPortalOpen =
    portal.state === 'present_window' || portal.state === 'late_window';

  const handleCheckIn = async () => {
    if (!isPortalOpen) {
      toast.error(portal.closedMessage || 'Attendance portal is currently closed.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<AttendanceRecord>('/attendance/check-in', {
        notes: notes.trim() || undefined,
      });
      toast.success(
        res.data?.status === 'late'
          ? 'Checked in (marked Late — after 9:10 AM).'
          : 'Checked in on time (marked Present).',
      );
      setNotes('');
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to check in'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    try {
      await api.post('/attendance/check-out', {
        notes: notes.trim() || undefined,
      });
      toast.success('Checked out successfully. Great work today.');
      setNotes('');
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to check out'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const portalPillClass =
    portal.state === 'present_window'
      ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
      : portal.state === 'late_window'
        ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
        : 'border-rose-400/30 bg-rose-500/15 text-rose-200';

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0A0D14] p-6 text-[#FAF8F5] shadow-xl shadow-black/15 sm:p-7">
      <div className="nh-silk-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A25B]/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#0F766E]/15 blur-[80px]" />

      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A25B]/30 bg-[#C9A25B]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#EAD3A1]">
              <Clock className="h-3.5 w-3.5" />
              <span>{roleLabel || 'Daily Attendance'}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold ${portalPillClass}`}
            >
              {portal.label}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {now
                ? now.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '--:--:--'}
            </span>
            <span className="text-xs font-medium text-[#9B9FA9]">
              {now
                ? now.toLocaleDateString([], {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>

          <p className="mt-2 font-mono text-[11px] text-[#8E93A0]">
            Office Hours: 9:00 AM – 5:00 PM &nbsp;•&nbsp; Portal: 8:30 AM – 5:00 PM
            &nbsp;•&nbsp; ≤ 9:10 AM Present &nbsp;•&nbsp; After 9:10 AM Late
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2">
              <span className="text-[#8D929E]">Check-In: </span>
              <span className="font-mono font-semibold text-[#FAF8F5]">
                {formatTime(todayRecord?.checkInTime)}
              </span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2">
              <span className="text-[#8D929E]">Check-Out: </span>
              <span className="font-mono font-semibold text-[#FAF8F5]">
                {formatTime(todayRecord?.checkOutTime)}
              </span>
            </div>
            {todayRecord && <StatusBadge status={todayRecord.status} />}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:max-w-sm">
          {!hasCheckedIn ? (
            isPortalOpen ? (
              <>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional location or shift note (e.g. HQ / Remote)..."
                  className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm text-[#FAF8F5] placeholder:text-[#7D8290] focus:border-[#C9A25B]/70 focus:outline-none focus:ring-2 focus:ring-[#C9A25B]/25"
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCheckIn}
                  className="nh-btn-gold px-5 py-3 text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  {submitting
                    ? 'Recording Check-In...'
                    : portal.state === 'late_window'
                      ? 'Check In Now (Late)'
                      : 'Check In Now'}
                </button>
                {portal.state === 'late_window' && (
                  <p className="flex items-center gap-1.5 text-[11px] text-amber-300/90">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Checking in after 9:10 AM is recorded as Late.
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-100">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div>
                  <p className="font-semibold text-white">
                    Attendance Portal Closed
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-rose-200/85">
                    {portal.closedMessage ||
                      'Attendance is open daily from 8:30 AM to 5:00 PM.'}
                  </p>
                </div>
              </div>
            )
          ) : !hasCheckedOut ? (
            <>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional checkout note..."
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm text-[#FAF8F5] placeholder:text-[#7D8290] focus:border-[#C9A25B]/70 focus:outline-none focus:ring-2 focus:ring-[#C9A25B]/25"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAD3A1]/30 bg-white/[0.1] px-5 py-3 text-sm font-semibold text-[#FAF8F5] transition hover:bg-white/[0.16] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-[#EAD3A1]" />
                {submitting ? 'Recording Check-Out...' : 'Check Out Now'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Shift Completed</p>
                <p className="text-xs text-emerald-200/80">
                  Logged{' '}
                  <span className="font-mono font-bold text-white">
                    {todayRecord?.workHours || 0} hrs
                  </span>{' '}
                  today
                </p>
              </div>
              <Sparkles className="ml-auto h-4 w-4 text-[#EAD3A1]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
