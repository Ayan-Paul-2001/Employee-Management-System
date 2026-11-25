'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Search,
  Crown,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Lock,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import type { User } from '@/lib/types';
import { AvatarCircle, RoleBadge } from '@/components/Badges';

export default function TeamDirectoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isHr = user?.role === 'hr';

  const cachedMembers = user ? getCached<User[]>(`${user.id}:team`) : null;
  const [members, setMembers] = useState<User[]>(cachedMembers || []);
  const [loading, setLoading] = useState(!cachedMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const fetchMembers = useCallback(async () => {
    const key = `${user?.id || 'anon'}:team`;
    const cached = getCached<User[]>(key);
    if (cached) {
      setMembers(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await api.get<User[]>('/users');
      setMembers(res.data || []);
      setCached(key, res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && (user.role === 'hr' || user.role === 'admin')) {
      fetchMembers();
    }
  }, [user, fetchMembers]);

  const handleRoleChange = async (
    target: User,
    newRole: 'admin' | 'employee',
  ) => {
    setBusyId(target.id);
    try {
      await api.patch(`/users/${target.id}/role`, { role: newRole });
      toast.success(
        `${target.fullName} is now ${newRole === 'admin' ? 'an Admin' : 'an Employee'}.`,
      );
      invalidateCache('team');
      invalidateCache('overview');
      invalidateCache('analytics');
      await fetchMembers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update role'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUser = async (target: User) => {
    if (
      !window.confirm(
        `Remove ${target.fullName} from Next Hunt Management System?`,
      )
    ) {
      return;
    }
    setBusyId(target.id);
    try {
      await api.delete(`/users/${target.id}`);
      toast.success(`${target.fullName} removed.`);
      await fetchMembers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove user'));
    } finally {
      setBusyId(null);
    }
  };

  const filtered = members.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.employeeCode?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q)
    );
  });

  const hrCount = members.filter((m) => m.role === 'hr').length;
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const employeeCount = members.filter((m) => m.role === 'employee').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#111318]">
            Team Directory &amp; Role Governance
          </h2>
          <p className="mt-0.5 text-sm text-[#6B6E76]">
            {isHr
              ? 'Promote Employees to Admin or adjust role access with HR Super Admin authority.'
              : 'View organization members across departments.'}
          </p>
        </div>

        {!isHr && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#EAD09B] bg-[#FBF4E4] px-3.5 py-2 text-xs font-semibold text-[#855E1F]">
            <Lock className="h-3.5 w-3.5" />
            Role upgrades are restricted to HR Super Admin only
          </div>
        )}
      </div>

      {/* Role Headcount Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="nh-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
            HR Super Admins
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#9A7432]">
            {hrCount}
          </p>
        </div>
        <div className="nh-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
            Admins
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0F766E]">
            {adminCount}
          </p>
        </div>
        <div className="nh-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
            Employees
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#111318]">
            {employeeCount}
          </p>
        </div>
      </div>

      {/* Directory Table */}
      <div className="nh-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#EFECE5] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
            {(['all', 'hr', 'admin', 'employee'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase transition ${
                  roleFilter === r
                    ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                    : 'text-[#6B6E76] hover:text-[#111318]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="nh-field-box !w-full sm:!w-68">
            <Search className="h-4 w-4 shrink-0 text-[#8B8982]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, code, dept..."
              className="nh-field-input !py-1.5 !text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EFECE5] bg-[#FAF9F5] text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
                <th className="px-6 py-3.5">Member</th>
                <th className="px-4 py-3.5">Department &amp; Title</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Joined</th>
                {isHr && <th className="px-6 py-3.5 text-right">HR Governance</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE8]">
              {loading ? (
                <tr>
                  <td
                    colSpan={isHr ? 5 : 4}
                    className="px-6 py-12 text-center text-sm text-[#8E919A]"
                  >
                    Loading team directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isHr ? 5 : 4} className="px-6 py-12 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-[#D5D1C7]" />
                    <p className="text-sm font-medium text-[#52555E]">
                      No matching members found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-[#FAF9F5]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarCircle
                          name={member.fullName}
                          role={member.role}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-[#111318]">
                            {member.fullName}
                          </p>
                          <p className="font-mono text-[11px] text-[#7D8088]">
                            {member.employeeCode} • {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-[#2C2F36]">
                        {member.department || 'General'}
                      </p>
                      <p className="text-xs text-[#7D8088]">
                        {member.position || 'Team Member'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[#73767E]">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {isHr && (
                      <td className="px-6 py-4 text-right">
                        {member.role === 'hr' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7432]">
                            <Crown className="h-3.5 w-3.5" />
                            Protected Super Admin
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {member.role === 'employee' ? (
                              <button
                                type="button"
                                disabled={busyId === member.id}
                                onClick={() => handleRoleChange(member, 'admin')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#0D625C] disabled:opacity-50"
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                Upgrade to Admin
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyId === member.id}
                                onClick={() =>
                                  handleRoleChange(member, 'employee')
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFDCD2] bg-white px-3 py-1.5 text-xs font-semibold text-[#42454D] transition hover:bg-[#FAF9F5] disabled:opacity-50"
                              >
                                <ArrowDownCircle className="h-3.5 w-3.5" />
                                Set as Employee
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busyId === member.id}
                              onClick={() => handleDeleteUser(member)}
                              title="Remove member"
                              className="rounded-xl border border-[#E2DFD6] p-1.5 text-[#8E919A] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
