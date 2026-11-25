'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Search, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import type { AttendanceRecord } from '@/lib/types';
import { AttendancePunchCard } from '@/components/AttendancePunchCard';
import { AvatarCircle, RoleBadge, StatusBadge } from '@/components/Badges';

export default function AttendancePage() {
  const { user } = useAuth();
  const isHr = user?.role === 'hr';
  const isManager = user?.role === 'hr' || user?.role === 'admin';
  const canGiveAttendance = user?.role === 'employee' || user?.role === 'admin';

  const cachedMe =
    user && canGiveAttendance
      ? getCached<{ today: AttendanceRecord | null; records: AttendanceRecord[] }>(
          `${user.id}:att:me`,
        )
      : null;
  const cachedTeam =
    user && isManager
      ? getCached<AttendanceRecord[]>(`${user.id}:att:team::all`)
      : null;

  const [tab, setTab] = useState<'my' | 'team'>(isHr ? 'team' : 'my');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(
    cachedMe?.today || null,
  );
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>(
    cachedMe?.records || [],
  );
  const [teamRecords, setTeamRecords] = useState<AttendanceRecord[]>(
    cachedTeam || [],
  );
  const [loading, setLoading] = useState(!(cachedMe || cachedTeam));

  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isHr) setTab('team');
  }, [isHr]);

  const fetchMyAttendance = useCallback(async () => {
    if (!canGiveAttendance || !user) return;
    const key = `${user.id}:att:me`;
    const cached = getCached<{ today: AttendanceRecord | null; records: AttendanceRecord[] }>(key);
    if (cached) {
      setTodayRecord(cached.today);
      setMyRecords(cached.records || []);
      setLoading(false);
    }
    try {
      const res = await api.get<{
        today: AttendanceRecord | null;
        records: AttendanceRecord[];
      }>('/attendance/me');
      setTodayRecord(res.data.today);
      setMyRecords(res.data.records || []);
      setCached(key, res.data);
    } catch {}
  }, [canGiveAttendance, user]);

  const fetchTeamAttendance = useCallback(async () => {
    if (!isManager || !user) return;
    const key = `${user.id}:att:team:${dateFilter}:${roleFilter}`;
    const cached = getCached<AttendanceRecord[]>(key);
    if (cached) {
      setTeamRecords(cached);
      setLoading(false);
    }
    try {
      const params: Record<string, string> = {};
      if (dateFilter) params.date = dateFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      const res = await api.get<AttendanceRecord[]>('/attendance', { params });
      setTeamRecords(res.data || []);
      setCached(key, res.data || []);
    } catch {}
  }, [isManager, user, dateFilter, roleFilter]);

  const loadAll = useCallback(async () => {
    await Promise.all([fetchMyAttendance(), fetchTeamAttendance()]);
    setLoading(false);
  }, [fetchMyAttendance, fetchTeamAttendance]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredTeam = teamRecords.filter((rec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      rec.user?.fullName?.toLowerCase().includes(q) ||
      rec.user?.email?.toLowerCase().includes(q) ||
      rec.user?.employeeCode?.toLowerCase().includes(q) ||
      rec.user?.department?.toLowerCase().includes(q)
    );
  });

  const formatTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  return (
    <div className="space-y-6">
      {/* HR Executive Header (HR monitors team attendance; does not punch in/out) */}
      {isHr ? (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#111318]">
              Workforce Attendance Ledger
            </h2>
            <p className="mt-0.5 text-sm text-[#6B6E76]">
              Monitor daily Check-In and Check-Out records across all Employees and
              Admins.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#DFC48E] bg-[#FAF3E3] px-4 py-2 font-mono text-xs font-semibold text-[#855E1F]">
            <Clock className="h-3.5 w-3.5 text-[#B68938]" />
            Portal: 8:30 AM – 5:00 PM (≤ 9:10 AM Present • After 9:10 AM Late)
          </div>
        </div>
      ) : (
        /* Employee & Admin Daily Check-In/Out Punch Card */
        <AttendancePunchCard
          todayRecord={todayRecord}
          onUpdated={() => {
            invalidateCache('att');
            invalidateCache('overview');
            invalidateCache('analytics');
            loadAll();
          }}
          roleLabel={
            user?.role === 'admin' ? 'Admin Attendance' : 'Employee Attendance'
          }
        />
      )}

      <div className="nh-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#EFECE5] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {isHr ? (
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading text-sm font-bold text-[#111318]">
                Team Attendance Log
              </h3>
              <span className="rounded-lg bg-[#F4F2EC] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#52555E]">
                {filteredTeam.length} record{filteredTeam.length === 1 ? '' : 's'}
              </span>
            </div>
          ) : (
            <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
              <button
                type="button"
                onClick={() => setTab('my')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  tab === 'my'
                    ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                    : 'text-[#6B6E76] hover:text-[#111318]'
                }`}
              >
                My Attendance ({myRecords.length})
              </button>
              {isManager && (
                <button
                  type="button"
                  onClick={() => setTab('team')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                    tab === 'team'
                      ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                      : 'text-[#6B6E76] hover:text-[#111318]'
                  }`}
                >
                  Team Attendance ({teamRecords.length})
                </button>
              )}
            </div>
          )}

          {(tab === 'team' || isHr) && isManager && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="nh-field-box !w-48 !px-3">
                <Search className="h-3.5 w-3.5 shrink-0 text-[#8B8982]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search member..."
                  className="nh-field-input !py-1.5 !text-xs"
                />
              </div>

              <div className="nh-field-box !w-auto !px-3">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-[#8B8982]" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent py-1.5 font-mono text-xs font-medium text-[#111318] outline-none"
                />
              </div>

              <div className="nh-field-box !w-auto !px-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="cursor-pointer appearance-none bg-transparent py-1.5 pr-4 text-xs font-semibold text-[#111318] outline-none"
                >
                  <option value="all">All Tracked Staff</option>
                  <option value="employee">Employees</option>
                  <option value="admin">Admins</option>
                </select>
                <ChevronDown className="pointer-events-none h-3.5 w-3.5 text-[#8B8982]" />
              </div>

              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-xs font-bold text-[#9A7432] hover:text-[#6E501D]"
                >
                  Clear date
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {!isHr && tab === 'my' ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFECE5] bg-[#FAF9F5] text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Check-In</th>
                  <th className="px-4 py-3.5">Check-Out</th>
                  <th className="px-4 py-3.5">Work Hours</th>
                  <th className="px-4 py-3.5">Notes</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE8]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-[#8E919A]"
                    >
                      Loading attendance records...
                    </td>
                  </tr>
                ) : myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Clock className="mx-auto mb-2 h-8 w-8 text-[#D5D1C7]" />
                      <p className="text-sm font-semibold text-[#52555E]">
                        No attendance history yet
                      </p>
                      <p className="text-xs text-[#8E919A]">
                        Standard shift is 9:00 AM – 5:00 PM. Tap Check In above to
                        begin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  myRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAF9F5]">
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#111318]">
                        {rec.date}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#42454D]">
                        {formatTime(rec.checkInTime)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#42454D]">
                        {formatTime(rec.checkOutTime)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#111318]">
                        {rec.workHours ? `${rec.workHours} hrs` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#73767E]">
                        {rec.notes || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFECE5] bg-[#FAF9F5] text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Check-In</th>
                  <th className="px-4 py-3.5">Check-Out</th>
                  <th className="px-4 py-3.5">Hours</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE8]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-[#8E919A]"
                    >
                      Loading team attendance...
                    </td>
                  </tr>
                ) : filteredTeam.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm text-[#73767E]"
                    >
                      No attendance records match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAF9F5]">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <AvatarCircle
                            name={rec.user?.fullName || 'User'}
                            role={rec.user?.role}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-[#111318]">
                              {rec.user?.fullName || 'Unknown'}
                            </p>
                            <p className="font-mono text-[11px] text-[#7D8088]">
                              {rec.user?.employeeCode} • {rec.user?.department}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {rec.user && <RoleBadge role={rec.user.role} />}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#111318]">
                        {rec.date}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#42454D]">
                        {formatTime(rec.checkInTime)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#42454D]">
                        {formatTime(rec.checkOutTime)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#111318]">
                        {rec.workHours ? `${rec.workHours}h` : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
