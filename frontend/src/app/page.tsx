'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (
        user.role !== 'hr' &&
        (user.approvalStatus === 'pending' ||
          user.approvalStatus === 'rejected' ||
          user.isApproved === false)
      ) {
        router.replace('/pending-approval');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090B10] text-[#FAF8F5]">
      <BrandLogo variant="dark" />
      <div className="mt-6 flex items-center gap-2.5 text-xs font-medium tracking-wide text-[#9A9DA6]">
        <span className="h-2 w-2 animate-ping rounded-full bg-[#C9A25B]" />
        <span>Entering executive workspace...</span>
      </div>
    </div>
  );
}
