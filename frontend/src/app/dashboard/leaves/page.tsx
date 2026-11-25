'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarPlus,
  Check,
  X,
  Trash2,
  CalendarDays,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import type { LeaveRequestItem, LeaveType } from '@/lib/types';
import { AvatarCircle, RoleBadge, StatusBadge } from '@/components/Badges';

export default function LeavesPage() {
  const { user } = useAuth();
  const isHr = user?.role === 'hr';
  const isManager = user?.role === 'hr' || user?.role === 'admin';
  const canApplyLeave = user?.role === 'employee' || user?.role === 'admin';

  const cachedAll =
    user && isManager ? getCached<LeaveRequestItem[]>(`${user.id}:leaves:all`) : null;
  const cachedMine =
    user && canApplyLeave ? getCached<LeaveRequestItem[]>(`${user.id}:leaves:me`) : null;

  const [tab, setTab] = useState<'queue' | 'mine'>(isManager ? 'queue' : 'mine');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allLeaves, setAllLeaves] = useState<LeaveRequestItem[]>(cachedAll || []);
  const [myLeaves, setMyLeaves] = useState<LeaveRequestItem[]>(cachedMine || []);
  const [loading, setLoading] = useState(!(cachedAll || cachedMine));

  const [applyOpen, setApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reviewModal, setReviewModal] = useState<{
    leave: LeaveRequestItem;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    setTab(isManager ? 'queue' : 'mine');
  }, [isManager]);

  const fetchLeaves = useCallback(async () => {
    if (!user) return;
    const myKey = `${user.id}:leaves:me`;
    const allKey = `${user.id}:leaves:all`;
    let hasCache = false;

    if (user.role === 'employee' || user.role === 'admin') {
      const c = getCached<LeaveRequestItem[]>(myKey);
      if (c) {
        setMyLeaves(c);
        hasCache = true;
      }
    }
    if (user.role === 'hr' || user.role === 'admin') {
      const c = getCached<LeaveRequestItem[]>(allKey);
      if (c) {
        setAllLeaves(c);
        hasCache = true;
      }
    }
    if (!hasCache) setLoading(true);
    else setLoading(false);

    try {
      const reqs: Promise<void>[] = [];
      if (user.role === 'employee' || user.role === 'admin') {
        reqs.push(
          api.get<LeaveRequestItem[]>('/leave/me').then((res) => {
            setMyLeaves(res.data || []);
            setCached(myKey, res.data || []);
          }),
        );
      }
      if (user.role === 'hr' || user.role === 'admin') {
        reqs.push(
          api.get<LeaveRequestItem[]>('/leave').then((res) => {
            setAllLeaves(res.data || []);
            setCached(allKey, res.data || []);
          }),
        );
      }
      await Promise.all(reqs);
    } catch {} finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const computedDays = (() => {
    if (!fromDate || !toDate) return 0;
    const f = new Date(fromDate);
    const t = new Date(toDate);
    if (f > t) return 0;
    return Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
  })();

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || computedDays <= 0) {
      toast.error('Please select a valid start and end date.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/leave', {
        leaveType,
        fromDate,
        toDate,
        reason: reason.trim(),
      });
      toast.success('Leave application submitted! HR & Admin have been notified.');
      setApplyOpen(false);
      setFromDate('');
      setToDate('');
      setReason('');
      invalidateCache('leaves');
      invalidateCache('overview');
      await fetchLeaves();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit leave request'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await api.patch(`/leave/${reviewModal.leave.id}/${reviewModal.action}`, {
        reviewNote: reviewNote.trim() || undefined,
      });
      toast.success(
        `Leave request ${reviewModal.action === 'approve' ? 'approved' : 'rejected'}.`,
      );
      setReviewModal(null);
      setReviewNote('');
      invalidateCache('leaves');
      invalidateCache('overview');
      invalidateCache('analytics');
      await fetchLeaves();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Action failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id: string) => {
    try {
      await api.delete(`/leave/${id}`);
      toast.success('Leave request removed.');
      await fetchLeaves();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Unable to delete leave request'));
    }
  };

  const visibleList = (tab === 'queue' ? allLeaves : myLeaves).filter((lv) =>
    statusFilter === 'all' ? true : lv.status === statusFilter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#111318]">
            Leave Management
          </h2>
          <p className="mt-0.5 text-sm text-[#6B6E76]">
            {isHr
              ? 'Review, approve, or reject leave applications submitted by Employees and Admins.'
              : isManager
                ? 'Review employee leave applications and manage your own leave requests.'
                : 'Apply for leave and track approval decisions from HR & Admin.'}
          </p>
        </div>

        {canApplyLeave && (
          <button
            type="button"
            onClick={() => setApplyOpen(true)}
            className="nh-btn-primary px-4 py-2.5 text-xs"
          >
            <CalendarPlus className="h-4 w-4 text-[#EAD3A1]" />
            Apply for Leave
          </button>
        )}
      </div>

      <div className="nh-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#EFECE5] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {isHr ? (
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading text-sm font-bold text-[#111318]">
                Team Leave Applications
              </h3>
              <span className="rounded-lg bg-[#F4F2EC] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#52555E]">
                {allLeaves.length} total
              </span>
            </div>
          ) : (
            <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
              {isManager && (
                <button
                  type="button"
                  onClick={() => setTab('queue')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                    tab === 'queue'
                      ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                      : 'text-[#6B6E76] hover:text-[#111318]'
                  }`}
                >
                  Team Queue ({allLeaves.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setTab('mine')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  tab === 'mine'
                    ? 'bg-white text-[#111318] shadow-2xs ring-1 ring-black/[0.05]'
                    : 'text-[#6B6E76] hover:text-[#111318]'
                }`}
              >
                My Applications ({myLeaves.length})
              </button>
            </div>
          )}

          <div className="inline-flex rounded-xl border border-[#E5E2D9] bg-[#F4F2EC] p-1">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? 'bg-white text-[#111318] shadow-2xs'
                    : 'text-[#6B6E76] hover:text-[#111318]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#F2EFE8]">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#8E919A]">
              Loading leave applications...
            </div>
          ) : visibleList.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CalendarDays className="mx-auto mb-2.5 h-9 w-9 text-[#D5D1C7]" />
              <p className="text-sm font-semibold text-[#52555E]">
                No leave requests found
              </p>
              <p className="mt-1 text-xs text-[#8E919A]">
                Switch status filters or submit a new leave application.
              </p>
            </div>
          ) : (
            visibleList.map((lv) => {
              const isOwn = lv.applicant?.id === user?.id;
              const canReview =
                isManager &&
                tab === 'queue' &&
                lv.status === 'pending' &&
                (!isOwn || user?.role === 'hr');

              return (
                <div
                  key={lv.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAF9F5] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <AvatarCircle
                      name={lv.applicant?.fullName || user?.fullName || 'User'}
                      role={lv.applicant?.role || user?.role}
                      size="md"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#111318]">
                          {lv.applicant?.fullName || user?.fullName}
                        </h3>
                        {lv.applicant && <RoleBadge role={lv.applicant.role} />}
                        <span className="rounded-md bg-[#FAF3E3] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[#8F6B2E]">
                          {lv.leaveType}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#5C5F66]">
                          {lv.days} day{lv.days > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#7D8088]">
                        {new Date(lv.fromDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        →{' '}
                        {new Date(lv.toDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-[#3F424A]">{lv.reason}</p>
                      {lv.reviewNote && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#F4F2EC] px-2.5 py-1 text-xs text-[#52555E]">
                          <MessageSquare className="h-3.5 w-3.5 text-[#9A7432]" />
                          <span>
                            <strong>{lv.reviewer?.fullName || 'Reviewer'}:</strong>{' '}
                            {lv.reviewNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                    <StatusBadge status={lv.status} />

                    {canReview && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewNote('');
                            setReviewModal({ leave: lv, action: 'approve' });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0D625C]"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewNote('');
                            setReviewModal({ leave: lv, action: 'reject' });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#F3CCD5] bg-[#FDF1F3] px-3.5 py-2 text-xs font-semibold text-[#9F1239] transition hover:bg-[#FCE2E8]"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </>
                    )}

                    {lv.status === 'pending' && isOwn && (
                      <button
                        type="button"
                        onClick={() => handleCancelLeave(lv.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#E2DFD6] px-3 py-1.5 text-xs font-semibold text-[#5C5F66] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B10]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#111318]">
                  Apply for Leave
                </h3>
                <p className="text-xs text-[#73767E]">
                  Admin &amp; HR will review and notify you via dashboard &amp; email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyOpen(false)}
                className="rounded-lg p-1.5 text-[#8E919A] hover:bg-[#F4F2EC] hover:text-[#111318]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="nh-input"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Vacation</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="nh-input font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    min={fromDate}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="nh-input font-mono"
                  />
                </div>
              </div>

              {computedDays > 0 && (
                <div className="rounded-xl border border-[#E7D4A7] bg-[#FAF3E3] px-4 py-2.5 text-xs font-semibold text-[#855E1F]">
                  Duration: <span className="font-mono">{computedDays}</span>{' '}
                  calendar day{computedDays > 1 ? 's' : ''}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Reason
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details or handover notes..."
                  className="nh-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyOpen(false)}
                  className="rounded-xl border border-[#DFDCD2] px-4 py-2 text-xs font-semibold text-[#5C5F66] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="nh-btn-primary px-5 py-2.5 text-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B10]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white shadow-2xl">
            <div className="border-b border-[#EFECE5] px-6 py-4">
              <h3 className="font-heading text-lg font-bold text-[#111318]">
                {reviewModal.action === 'approve'
                  ? 'Approve Leave Application'
                  : 'Reject Leave Application'}
              </h3>
              <p className="mt-0.5 text-xs text-[#73767E]">
                {reviewModal.leave.applicant?.fullName} • {reviewModal.leave.days} day(s)
              </p>
            </div>
            <form onSubmit={handleConfirmReview} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Reviewer Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewModal.action === 'approve'
                      ? 'e.g. Approved, enjoy your time off.'
                      : 'e.g. Please coordinate coverage first.'
                  }
                  className="nh-input resize-none"
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="rounded-xl border border-[#DFDCD2] px-4 py-2 text-xs font-semibold text-[#5C5F66] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60 ${
                    reviewModal.action === 'approve'
                      ? 'bg-[#0F766E] hover:bg-[#0D625C]'
                      : 'bg-[#BE123C] hover:bg-[#9F1239]'
                  }`}
                >
                  {submitting
                    ? 'Saving...'
                    : reviewModal.action === 'approve'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
