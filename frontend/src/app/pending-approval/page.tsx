'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Building2,
  Mail,
  BadgeCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { AvatarCircle } from '@/components/Badges';

export default function PendingApprovalLobbyPage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const isApprovedUser =
    user &&
    (user.role === 'hr' ||
      user.approvalStatus === 'approved' ||
      (user.approvalStatus === undefined && user.isApproved !== false));

  const isRejected = user?.approvalStatus === 'rejected';

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && isApprovedUser) {
      router.replace('/dashboard');
    }
  }, [user, loading, isApprovedUser, router]);

  const checkApprovalStatus = useCallback(
    async (manual = false) => {
      if (manual) setChecking(true);
      try {
        const fresh = await refreshUser();
        if (
          fresh &&
          (fresh.role === 'hr' ||
            fresh.approvalStatus === 'approved' ||
            (fresh.approvalStatus === undefined && fresh.isApproved !== false))
        ) {
          toast.success('Your employment account has been approved! Welcome aboard.');
          router.replace('/dashboard');
        } else if (manual && fresh?.approvalStatus === 'pending') {
          toast('Still awaiting HR or Admin review. Checking automatically.', {
            icon: '⏳',
          });
        }
      } finally {
        if (manual) setChecking(false);
      }
    },
    [refreshUser, router],
  );

  // Live background status check every 8 seconds while pending
  useEffect(() => {
    if (!user || isApprovedUser || isRejected) return;
    const timer = setInterval(() => {
      void checkApprovalStatus(false);
    }, 8000);
    return () => clearInterval(timer);
  }, [user, isApprovedUser, isRejected, checkApprovalStatus]);

  if (loading || !user || isApprovedUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090B10] text-[#FAF8F5]">
        <BrandLogo variant="dark" />
        <div className="mt-6 flex items-center gap-2 text-xs text-[#9A9DA6]">
          <span className="h-2 w-2 animate-ping rounded-full bg-[#C9A25B]" />
          <span>Checking application status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F5F1]">
      {/* Minimal Executive Top Header */}
      <header className="border-b border-[#E6E3DA] bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <BrandLogo variant="light" />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DFDCD2] bg-white px-4 py-2 text-xs font-semibold text-[#42454D] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Waiting Lobby Stage */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <div className="nh-card overflow-hidden">
          {/* Top Obsidian Status Banner */}
          <div className="relative overflow-hidden bg-[#0A0D14] px-7 py-8 text-[#FAF8F5] sm:px-10 sm:py-9">
            <div className="nh-silk-grid pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A25B]/15 blur-[80px]" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {isRejected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/35 bg-rose-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-200">
                    <XCircle className="h-3.5 w-3.5" />
                    Application Not Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A25B]/35 bg-[#C9A25B]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#EAD3A1]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#EAD3A1]" />
                    Waiting Lobby • Pending Review
                  </span>
                )}

                <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {isRejected ? (
                    <>
                      Employment request{' '}
                      <span className="font-editorial font-normal italic text-rose-300">
                        declined.
                      </span>
                    </>
                  ) : (
                    <>
                      Your application is{' '}
                      <span className="font-editorial font-normal italic text-[#EAD3A1]">
                        under review.
                      </span>
                    </>
                  )}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#A4A9B5]">
                  {isRejected
                    ? 'HR or Admin has reviewed your registration request and did not approve workspace access at this time.'
                    : 'Welcome to Next Hunt Management System. HR & Admin have been notified and are reviewing your employment request before unlocking workspace access.'}
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05]">
                {isRejected ? (
                  <ShieldAlert className="h-8 w-8 text-rose-400" />
                ) : (
                  <Clock className="h-8 w-8 text-[#EAD3A1]" />
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-6 p-7 sm:p-10">
            {/* Applicant Dossier Card */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#EAE7DF] bg-[#FAF9F5] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3.5">
                <AvatarCircle name={user.fullName} role={user.role} size="lg" />
                <div>
                  <h2 className="font-heading text-base font-bold text-[#111318]">
                    {user.fullName}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B6E76]">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#9A7432]" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#9A7432]" />
                      {user.department || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E0D6] bg-white px-3 py-1 font-mono text-xs font-bold text-[#111318]">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#9A7432]" />
                  {user.employeeCode}
                </span>
                <p className="mt-1 text-[11px] text-[#8E919A]">
                  Applied{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Today'}
                </p>
              </div>
            </div>

            {isRejected ? (
              <div className="rounded-2xl border border-[#F3CCD5] bg-[#FEF4F6] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9F1239]">
                  Reviewer Decision Note
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#42454D]">
                  {user.rejectionReason ||
                    'No additional note was provided. Please reach out to Human Resources if you believe this was in error.'}
                </p>
              </div>
            ) : (
              /* 3-Step Onboarding Stepper */
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73767E]">
                  Onboarding Progress
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#CBE7DE] bg-[#F2FBF8] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0D6A4E]">
                      <CheckCircle2 className="h-4 w-4 text-[#0F766E]" />
                      1. Submitted
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#2D6E5C]">
                      Your employee profile was created and queued cleanly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E4CFA0] bg-[#FDF9EE] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#855E1F]">
                      <Clock className="h-4 w-4 animate-pulse text-[#B68938]" />
                      2. HR / Admin Review
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6E5629]">
                      Waiting for approval from an HR Super Admin or Admin.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E8E5DD] bg-[#FAF9F5] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#73767E]">
                      <Sparkles className="h-4 w-4 text-[#A9A69D]" />
                      3. Workspace Entry
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#7D8088]">
                      Unlocks automatically once your account is approved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EFECE5] pt-5 sm:flex-row">
              {!isRejected ? (
                <p className="text-xs text-[#73767E]">
                  Auto-refreshing approval status every 8 seconds.
                </p>
              ) : (
                <p className="text-xs text-[#73767E]">
                  You may sign out or contact HR for assistance.
                </p>
              )}

              <div className="flex items-center gap-2.5">
                {!isRejected && (
                  <button
                    type="button"
                    disabled={checking}
                    onClick={() => checkApprovalStatus(true)}
                    className="nh-btn-primary px-4 py-2.5 text-xs"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 text-[#EAD3A1] ${
                        checking ? 'animate-spin' : ''
                      }`}
                    />
                    {checking ? 'Checking...' : 'Check Status Now'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-[#DFDCD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#42454D] transition hover:bg-[#FAF9F5]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
