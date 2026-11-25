'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { OtpCodeInput } from '@/components/OtpCodeInput';
import { LuxurySelect } from '@/components/LuxurySelect';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';

type AuthMode = 'login' | 'signup' | 'forgot-email' | 'forgot-verify';

const DEPARTMENTS = [
  'Engineering',
  'Product Design',
  'Operations',
  'Human Resources',
  'Finance',
  'Growth & Marketing',
  'Customer Success',
  'General',
];

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams.get('mode') === 'signup' ? 'signup' : 'login',
  );
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state (NO role field — always defaults to Employee)
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      const needsApproval =
        user.role !== 'hr' &&
        (user.approvalStatus === 'pending' ||
          user.approvalStatus === 'rejected' ||
          user.isApproved === false);
      router.replace(needsApproval ? '/pending-approval' : '/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const loggedInUser = await login(loginEmail.trim(), loginPassword);
      const needsApproval =
        loggedInUser.role !== 'hr' &&
        (loggedInUser.approvalStatus === 'pending' ||
          loggedInUser.approvalStatus === 'rejected' ||
          loggedInUser.isApproved === false);

      if (needsApproval) {
        toast('Your application is currently in the Waiting Lobby.', { icon: '⏳' });
        router.replace('/pending-approval');
      } else {
        toast.success(`Welcome back, ${loggedInUser.fullName}`);
        router.replace('/dashboard');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await register({
        fullName: fullName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        department,
      });
      toast.success(
        `Application submitted, ${created.fullName}! Awaiting HR or Admin approval.`,
      );
      router.replace('/pending-approval');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail.trim() });
      toast.success('6-digit verification code sent to your email.');
      setMode('forgot-verify');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send verification code'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        email: resetEmail.trim(),
        code: resetCode,
        newPassword,
      });
      toast.success('Password reset complete! Sign in with your new password.');
      setLoginEmail(resetEmail.trim());
      setLoginPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setMode('login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setSubmitting(false);
    }
  };

  const isMainTab = mode === 'login' || mode === 'signup';

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
      {/* Left Executive Obsidian Showcase Panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#090B10] px-12 py-11 text-[#FAF8F5] lg:col-span-6 lg:flex xl:col-span-7 xl:px-16">
        {/* Atmospheric Ambient Lighting */}
        <div className="nh-silk-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-[#C9A25B]/[0.11] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-120px] bottom-[-120px] h-[440px] w-[440px] rounded-full bg-[#0F766E]/[0.14] blur-[120px]" />

        {/* Top Brand Row */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo variant="dark" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A25B]/25 bg-[#C9A25B]/[0.08] px-3 py-1 font-mono text-[11px] font-medium text-[#EAD3A1]">
            <Sparkles className="h-3 w-3" />
            SUITE 2.0
          </span>
        </div>

        {/* Center Editorial Hero + Bespoke Preview Card */}
        <div className="relative z-10 my-auto max-w-xl py-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#C9A25B]">
            Executive Workforce Architecture
          </p>

          <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[#FAF8F5] xl:text-[50px]">
            Orchestrate your people with{' '}
            <span className="font-editorial font-normal italic text-[#EAD3A1]">
              quiet precision.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#9FA4B0]">
            A refined command workspace unifying daily attendance for employees
            and admins, structured leave approvals, official company notices,
            and boardroom-ready HR PDF analytics.
          </p>

          {/* Editorial Corporate Discussion Showcase Photo */}
          <div className="group relative mt-9 overflow-hidden rounded-2xl border border-[#C9A25B]/25 bg-[#121620] shadow-2xl shadow-black/50">
            <img
              src="/corporate-discussion.jpg"
              alt="Executive leadership team engaged in a strategic discussion"
              className="aspect-[16/9] w-full object-cover object-center transition duration-700 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090B10]/85 via-[#090B10]/15 to-transparent" />
            <div className="absolute right-5 bottom-4 left-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#EAD3A1]">
                  Modern Leadership
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#FAF8F5]">
                  Built for aligned HR, Admin, and high-trust teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Rule */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.07] pt-6 text-xs text-[#6F7584]">
          <span>&copy; {new Date().getFullYear()} Next Hunt Management System</span>
          <span className="font-mono tracking-wider text-[#8C7448]">
            ENCRYPTED • MONGODB ATLAS
          </span>
        </div>
      </aside>

      {/* Right Alabaster Auth Studio */}
      <main className="flex flex-col justify-center bg-[#F6F5F1] px-5 py-10 sm:px-10 lg:col-span-6 xl:col-span-5">
        <div className="mx-auto w-full max-w-[448px]">
          {/* Mobile Brand Header */}
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo variant="light" />
          </div>

          <div className="nh-card overflow-visible p-7 sm:p-9">
            {/* Refined Segmented Tab Control for Sign In / Sign Up */}
            {isMainTab && (
              <div className="mb-7 grid grid-cols-2 rounded-xl border border-[#E8E5DD] bg-[#F4F2EC] p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-[9px] py-2 text-xs font-bold tracking-wide transition ${
                    mode === 'login'
                      ? 'bg-[#FFFFFF] text-[#111318] shadow-xs ring-1 ring-black/[0.05]'
                      : 'text-[#6E7078] hover:text-[#111318]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`rounded-[9px] py-2 text-xs font-bold tracking-wide transition ${
                    mode === 'signup'
                      ? 'bg-[#FFFFFF] text-[#111318] shadow-xs ring-1 ring-black/[0.05]'
                      : 'text-[#6E7078] hover:text-[#111318]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* SIGN IN VIEW */}
            {mode === 'login' && (
              <>
                <div className="mb-6">
                  <h2 className="font-heading text-[26px] font-bold tracking-tight text-[#111318]">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm text-[#6B6E76]">
                    Enter your credentials to access Next Hunt Management System.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Work Email
                    </label>
                    <div className="nh-field-box">
                      <Mail className="h-4 w-4 shrink-0 text-[#8B8982]" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@nexthunt.com"
                        className="nh-field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginEmail);
                          setMode('forgot-email');
                        }}
                        className="text-xs font-semibold text-[#9A7432] transition hover:text-[#6E501D]"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="nh-field-box">
                      <Lock className="h-4 w-4 shrink-0 text-[#8B8982]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="nh-field-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="shrink-0 text-[#8B8982] transition hover:text-[#111318]"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="nh-btn-primary mt-3 w-full py-3.5 text-sm"
                  >
                    <span>{submitting ? 'Signing in...' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="h-4 w-4 text-[#EAD3A1]" />
                  </button>
                </form>

                <div className="mt-6 border-t border-[#EFECE5] pt-5 text-center text-xs text-[#6B6E76]">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-bold text-[#111318] underline decoration-[#C9A25B] decoration-2 underline-offset-4 transition hover:text-[#8F6B2E]"
                  >
                    Create an account
                  </button>
                </div>
              </>
            )}

            {/* SIGN UP VIEW (Strictly no role field — always Employee) */}
            {mode === 'signup' && (
              <>
                <div className="mb-6">
                  <h2 className="font-heading text-[26px] font-bold tracking-tight text-[#111318]">
                    Join Next Hunt
                  </h2>
                  <p className="mt-1 text-sm text-[#6B6E76]">
                    New accounts start as Employee. HR &amp; Admins receive an instant
                    registration notification.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Full Name
                    </label>
                    <div className="nh-field-box">
                      <UserIcon className="h-4 w-4 shrink-0 text-[#8B8982]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="nh-field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Email Address
                    </label>
                    <div className="nh-field-box">
                      <Mail className="h-4 w-4 shrink-0 text-[#8B8982]" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="alex.morgan@nexthunt.com"
                        className="nh-field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Department
                    </label>
                    <LuxurySelect
                      value={department}
                      onChange={setDepartment}
                      options={DEPARTMENTS}
                      icon={<Building2 className="h-4 w-4 shrink-0 text-[#8B8982]" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                        Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="nh-input"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="nh-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="nh-btn-primary mt-3 w-full py-3.5 text-sm"
                  >
                    <span>
                      {submitting ? 'Creating Account...' : 'Create Employee Account'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#EAD3A1]" />
                  </button>
                </form>

                <div className="mt-6 border-t border-[#EFECE5] pt-5 text-center text-xs text-[#6B6E76]">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-[#111318] underline decoration-[#C9A25B] decoration-2 underline-offset-4 transition hover:text-[#8F6B2E]"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD — STEP 1 */}
            {mode === 'forgot-email' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6E76] transition hover:text-[#111318]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </button>
                <div className="mb-6">
                  <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF3E3] text-[#9A7432] ring-1 ring-[#E7D4A7]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#111318]">
                    Account Recovery
                  </h2>
                  <p className="mt-1.5 text-sm text-[#6B6E76]">
                    Enter your registered email to receive a 6-digit verification
                    code via email.
                  </p>
                </div>

                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Registered Email
                    </label>
                    <div className="nh-field-box">
                      <Mail className="h-4 w-4 shrink-0 text-[#8B8982]" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="name@nexthunt.com"
                        className="nh-field-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="nh-btn-primary mt-2 w-full py-3.5 text-sm"
                  >
                    <span>
                      {submitting ? 'Sending Code...' : 'Send Verification Code'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#EAD3A1]" />
                  </button>
                </form>
              </>
            )}

            {/* FORGOT PASSWORD — STEP 2 */}
            {mode === 'forgot-verify' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('forgot-email')}
                  className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6E76] transition hover:text-[#111318]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use another email
                </button>
                <div className="mb-6">
                  <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECF8F3] text-[#0D6A4E] ring-1 ring-[#B6E2D1]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#111318]">
                    Verify &amp; Set Password
                  </h2>
                  <p className="mt-1.5 text-sm text-[#6B6E76]">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-[#111318]">{resetEmail}</span>.
                  </p>
                </div>

                <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      6-Digit Email Code
                    </label>
                    <OtpCodeInput value={resetCode} onChange={setResetCode} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="nh-input"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="nh-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="nh-btn-primary mt-2 w-full py-3.5 text-sm"
                  >
                    {submitting ? 'Updating Password...' : 'Verify & Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F5F1]" />}>
      <AuthPageContent />
    </Suspense>
  );
}
