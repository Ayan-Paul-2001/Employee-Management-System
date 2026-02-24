'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      // Focus the next empty input or the last one
      const nextEmpty = newCode.findIndex(c => c === '');
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setStatus('error');
      setMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Email address is missing. Please go back to the registration page.');
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      await authService.verifyEmail(email, fullCode);
      setStatus('success');
      setMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Please check your code and try again.');
    }
  };

  const handleResend = async () => {
    if (!email || resendCountdown > 0) return;

    setResendStatus('sending');
    try {
      await authService.resendVerificationCode(email);
      setResendStatus('sent');
      setResendCountdown(60); // 60 second cooldown
      setMessage('');
      setStatus('idle');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendStatus('idle'), 3000);
    } catch (error: any) {
      setResendStatus('idle');
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6 && status === 'idle') {
      handleVerify();
    }
  }, [code]);

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => start + '*'.repeat(Math.min(middle.length, 6)) + end) : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">

          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
            {status === 'success' ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'success' ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="text-blue-200/60 text-sm mb-8">
            {status === 'success'
              ? 'Your account has been activated successfully.'
              : <>We&apos;ve sent a 6-digit verification code to<br /><span className="text-blue-300 font-medium">{maskedEmail}</span></>
            }
          </p>

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-300 text-sm font-medium">{message}</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                Go to Login
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Code Input State */}
          {status !== 'success' && (
            <div className="space-y-6">
              {/* 6-digit code inputs */}
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none
                      ${status === 'error'
                        ? 'border-red-500/50 bg-red-500/10 text-red-300'
                        : 'border-white/15 bg-white/[0.06] text-white focus:border-blue-500/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    disabled={status === 'verifying'}
                  />
                ))}
              </div>

              {/* Error message */}
              {status === 'error' && message && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-300 text-sm">{message}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={status === 'verifying' || code.join('').length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
              >
                {status === 'verifying' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>

              {/* Resend code */}
              <div className="pt-2">
                <p className="text-blue-200/40 text-xs mb-2">Didn&apos;t receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || resendStatus === 'sending'}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:text-blue-200/30 disabled:cursor-not-allowed transition-colors"
                >
                  {resendStatus === 'sending'
                    ? 'Sending...'
                    : resendStatus === 'sent'
                      ? '✓ Code sent!'
                      : resendCountdown > 0
                        ? `Resend code in ${resendCountdown}s`
                        : 'Resend verification code'}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 pt-4">
                <Link
                  href="/register"
                  className="text-blue-200/40 hover:text-blue-200/60 text-xs transition-colors"
                >
                  ← Back to Registration
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
