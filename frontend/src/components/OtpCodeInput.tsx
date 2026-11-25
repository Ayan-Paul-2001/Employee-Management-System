'use client';

import React, { useRef } from 'react';

interface OtpCodeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function OtpCodeInput({ value, onChange, disabled }: OtpCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleDigitChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const next = digits.slice();
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6);
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, 5);
      inputsRef.current[focusIdx]?.focus();
      return;
    }

    const next = digits.slice();
    next[index] = cleaned[0];
    onChange(next.join(''));
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2.5">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          disabled={disabled}
          value={digit}
          aria-label={`Verification code digit ${i + 1}`}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-full rounded-xl border border-[#DDD9CE] bg-[#FCFBFA] text-center font-mono text-lg font-bold text-[#111318] shadow-xs transition focus:border-[#111318] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#C9A25B]/25 disabled:bg-stone-100"
        />
      ))}
    </div>
  );
}
