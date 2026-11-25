'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  Check,
  X,
  Mail,
  Building2,
  Trash2,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import type { ApplicantItem, ApplicantsResponse } from '@/lib/types';
import { AvatarCircle, StatusBadge } from '@/components/Badges';

export default function ApplicantApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isHr = user?.role === 'hr';
  const canReview = user?.role === 'hr' || user?.role === 'admin';

  const cacheKey = user ? `${user.id}:applicants` : '';
  const initialCached = cacheKey
    ? getCached<ApplicantsResponse>(cacheKey)
    : null;

  const [data, setData] = useState<ApplicantsResponse>(
    initialCached || { items: [], pendingCount: 0, rejectedCount: 0 },
  );
  const [loading, setLoading] = useState(!initialCached);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'rejected' | 'all'>(
    'pending',
  );
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState<ApplicantItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    if (user && !canReview) {
      router.replace('/dashboard');
    }
  }, [user, canReview, router]);

  const fetchApplicants = useCallback(async () => {
    if (!user || !canReview) return;
    try {
      const res = await api.get<ApplicantsResponse>('/users/applicants');
      setData(res.data);
      setCached(`${user.id}:applicants`, res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, [user, canReview]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleApprove = async (applicant: ApplicantItem) => {
    setBusyId(applicant.id);
    try {
      await api.patch(`/users/${applicant.id}/approve`);
      toast.success(
        `${applicant.fullName} approved! They can now enter the Employee workspace.`,
      );
      invalidateCache('applicants');
      invalidateCache('team');
      invalidateCache('overview');
      invalidateCache('analytics');
      await fetchApplicants();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to approve applicant'));
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setSubmittingReject(true);
    try {
      await api.patch(`/users/${rejectTarget.id}/reject`, {
        reason: rejectReason.trim() || undefined,
      });
      toast.success(`${rejectTarget.fullName}'s application was rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      invalidateCache('applicants');
      invalidateCache('overview');
      await fetchApplicants();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject applicant'));
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleDeleteRejected = async (applicant: ApplicantItem) => {
    if (
      !window.confirm(
        `Permanently remove rejected applicant ${applicant.fullName}?`,
      )
    ) {
      return;
    }
    setBusyId(applicant.id);
    try {
      await api.delete(`/users/${applicant.id}`);
      toast.success(`${applicant.fullName} removed.`);
      invalidateCache('applicants');
      invalidateCache('overview');
      await fetchApplicants();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove applicant'));
    } finally {
      setBusyId(null);
    }
  };

  if (!user || !canReview) return null;

  const filtered = data.items.filter((item) => {
    if (statusFilter !== 'all' && item.approvalStatus !== statusFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.employeeCode?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#111318]">
            Employment Approvals
          </h2>
          <p className="mt-0.5 text-sm text-[#6B6E76]">
            Review new applicants waiting in the lobby and approve or reject their
            access to Next Hunt Management System.
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="nh-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
              Waiting in Lobby
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E3] text-[#9A7432]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-[#9A7432] tabular-nums">
            {data.pendingCount}
          </p>
          <p className="mt-1 text-xs text-[#73767E]">Awaiting HR or Admin review</p>
        </div>

        <div className="nh-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
              Rejected Applicants
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF1F3] text-[#BE123C]">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold text-[#BE123C] tabular-nums">
            {data.rejectedCount}
          </p>
          <p className="mt-1 text-xs text-[#73767E]">Can be re-approved anytime</p>
        </div>

        <div className="nh-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#73767E]">
              Approval Authority
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECF8F3] text-[#0F766E]">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-lg font-bold text-[#111318]">
            HR &amp; Admin
          </p>
          <p className="mt-1 text-xs text-[#73767E]">
            Approved users unlock Employee access instantly
          </p>
        </div>
      </div>

      {/* Applicants Queue Card */}
      <div className="nh-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#EFECE5] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
            {(
              [
                { key: 'pending', label: `Pending (${data.pendingCount})` },
                { key: 'rejected', label: `Rejected (${data.rejectedCount})` },
                { key: 'all', label: `All (${data.items.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === t.key
                    ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                    : 'text-[#6B6E76] hover:text-[#111318]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="nh-field-box !w-full sm:!w-68">
            <Search className="h-4 w-4 shrink-0 text-[#8B8982]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant name, email..."
              className="nh-field-input !py-1.5 !text-xs"
            />
          </div>
        </div>

        <div className="divide-y divide-[#F2EFE8]">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#8E919A]">
              Loading applicants...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <UserCheck className="mx-auto mb-3 h-10 w-10 text-[#D5D1C7]" />
              <p className="text-sm font-semibold text-[#52555E]">
                {statusFilter === 'pending'
                  ? 'No applicants waiting in the lobby'
                  : 'No matching applications found'}
              </p>
              <p className="mt-1 text-xs text-[#8E919A]">
                New employee registrations will appear here for HR &amp; Admin
                review.
              </p>
            </div>
          ) : (
            filtered.map((applicant) => {
              const isPending = applicant.approvalStatus === 'pending';
              const isBusy = busyId === applicant.id;

              return (
                <div
                  key={applicant.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAF9F5] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <AvatarCircle
                      name={applicant.fullName}
                      role={applicant.role}
                      size="md"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#111318]">
                          {applicant.fullName}
                        </h3>
                        <span className="rounded-md bg-[#F4F2EC] px-2 py-0.5 font-mono text-[11px] font-bold text-[#52555E]">
                          {applicant.employeeCode}
                        </span>
                        <StatusBadge
                          status={applicant.approvalStatus || 'pending'}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B6E76]">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-[#9A7432]" />
                          {applicant.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#9A7432]" />
                          {applicant.department || 'General'}
                        </span>
                      </div>

                      <p className="font-mono text-[11px] text-[#8E919A]">
                        Registered{' '}
                        {applicant.createdAt
                          ? new Date(applicant.createdAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Recently'}
                      </p>

                      {applicant.rejectionReason && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#FDF1F3] px-2.5 py-1 text-xs text-[#9F1239]">
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            <strong>
                              {applicant.reviewer?.fullName || 'Reviewer'}:
                            </strong>{' '}
                            {applicant.rejectionReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(applicant)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#0D625C] disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isBusy ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setRejectReason('');
                            setRejectTarget(applicant);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#F3CCD5] bg-[#FDF1F3] px-4 py-2 text-xs font-semibold text-[#9F1239] transition hover:bg-[#FCE2E8] disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(applicant)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#B6E2D1] bg-[#ECF8F3] px-3.5 py-2 text-xs font-semibold text-[#0D6A4E] transition hover:bg-[#DCF4EC] disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {isBusy ? 'Approving...' : 'Re-Approve'}
                        </button>
                        {isHr && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteRejected(applicant)}
                            title="Delete rejected application"
                            className="rounded-xl border border-[#E2DFD6] bg-white p-2 text-[#8E919A] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Applicant Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B10]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#111318]">
                  Reject Employment Application
                </h3>
                <p className="mt-0.5 text-xs text-[#73767E]">
                  {rejectTarget.fullName} ({rejectTarget.employeeCode})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-lg p-1.5 text-[#8E919A] hover:bg-[#F4F2EC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmReject} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Rejection Reason (Optional — visible in applicant lobby &amp; email)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unable to verify employment details at this time."
                  className="nh-input resize-none"
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="rounded-xl border border-[#DFDCD2] px-4 py-2 text-xs font-semibold text-[#5C5F66] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="rounded-xl bg-[#BE123C] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#9F1239] disabled:opacity-60"
                >
                  {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
