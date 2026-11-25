'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F5F1] px-4 text-center">
      <div className="nh-card max-w-md p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF1F3] text-[#BE123C]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#111318]">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-[#6B6E76]">
          {error?.message ||
            'An unexpected error occurred while rendering this page.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="nh-btn-primary px-4 py-2.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#EAD3A1]" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#DFDCD2] px-4 py-2.5 text-xs font-semibold text-[#42454D] hover:bg-[#FAF9F5]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
