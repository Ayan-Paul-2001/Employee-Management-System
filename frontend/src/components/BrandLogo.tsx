'use client';

import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = 'dark',
  compact = false,
  className = '',
}: BrandLogoProps) {
  const isLightText = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A0D14] via-[#151A26] to-[#1F2739] shadow-md shadow-black/25 ring-1 ring-[#C9A25B]/50">
        <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nh-monogram-gold" x1="16" y1="16" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F2D69B" />
              <stop offset="55%" stopColor="#CFA252" />
              <stop offset="100%" stopColor="#A67C37" />
            </linearGradient>
          </defs>
          <path
            d="M12 48V16H18.8L33.6 36.2V16H40.2V48H33.5L18.6 27.6V48H12Z"
            fill="#FAF8F5"
          />
          <path
            d="M44 16H50.8V48H44V35.2H39V29.4H44V16Z"
            fill="url(#nh-monogram-gold)"
          />
        </svg>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div
            className={`font-heading text-[17px] font-bold tracking-tight ${
              isLightText ? 'text-[#FAF8F5]' : 'text-[#0E1117]'
            }`}
          >
            Next Hunt
          </div>
          <div
            className={`text-[9.5px] font-semibold uppercase tracking-[0.24em] ${
              isLightText ? 'text-[#C9A25B]' : 'text-[#8F6B2E]'
            }`}
          >
            Management System
          </div>
        </div>
      )}
    </div>
  );
}
