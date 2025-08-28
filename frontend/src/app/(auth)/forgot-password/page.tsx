'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const verifyCodeSchema = z.object({
  code: z.string().min(6, 'Verification code must be at least 6 characters'),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const verifyCodeForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleEmailSubmit = async (data: EmailFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await authApi.requestPasswordReset(data.email);
      
      setEmail(data.email);
      setSuccess('Verification code sent to your email');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (data: VerifyCodeFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await authApi.verifyResetCode({ email, code: data.code });
      
      setSuccess('Code verified successfully');
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await authApi.resetPassword({ email, newPassword: data.newPassword });
      
      setSuccess('Password reset successfully. You can now login with your new password.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' && 'Reset your password'}
            {step === 'verify' && 'Verify your email'}
            {step === 'reset' && 'Set new password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...emailForm.register('email')}
                error={emailForm.formState.errors.email?.message}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send reset code
              </Button>
            </div>
          </form>
        )}
        
        {step === 'verify' && (
          <form className="mt-8 space-y-6" onSubmit={verifyCodeForm.handleSubmit(handleVerifyCodeSubmit)}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                {...verifyCodeForm.register('code')}
                error={verifyCodeForm.formState.errors.code?.message}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}
        
        {step === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...resetPasswordForm.register('newPassword')}
                error={resetPasswordForm.formState.errors.newPassword?.message}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...resetPasswordForm.register('confirmPassword')}
                error={resetPasswordForm.formState.errors.confirmPassword?.message}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}