'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const verifyEmailSchema = z.object({
  code: z.string().min(6, 'Verification code must be at least 6 characters'),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
  });

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const onSubmit = async (data: VerifyEmailFormValues) => {
    if (!email) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await authApi.verifyEmail({ email, code: data.code });
      
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      setResendLoading(true);
      setError(null);
      
      await authApi.resendVerificationCode(email);
      
      setSuccess('Verification code resent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to {email}
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              {...register('code')}
              error={errors.code?.message}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Verify Email
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="font-medium text-blue-600 hover:text-blue-500 text-sm"
              >
                {resendLoading ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/login" className="font-medium text-gray-600 hover:text-gray-500 text-sm">
                Back to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}