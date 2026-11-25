'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectOption = string | { label: string; value: string };

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
}

export function LuxurySelect({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select an option',
}: LuxurySelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalized = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  );
  const activeOption = normalized.find((o) => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`nh-field-box cursor-pointer justify-between text-left ${
          open
            ? '!border-[#111318] !bg-white shadow-[0_0_0_3.5px_rgba(201,162,91,0.22)]'
            : ''
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5 py-[0.72rem]">
          {icon}
          <span
            className={`truncate text-sm font-medium ${
              activeOption ? 'text-[#111318]' : 'text-[#9A9891]'
            }`}
          >
            {activeOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#8B8982] transition-transform duration-200 ${
            open ? 'rotate-180 text-[#111318]' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#E2DFD6] bg-white p-2 shadow-2xl shadow-black/15"
        >
          <div className="space-y-1">
            {normalized.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition ${
                    selected
                      ? 'bg-[#0A0D14] font-semibold text-[#FAF8F5]'
                      : 'font-medium text-[#2C2F36] hover:bg-[#F6F5F1] hover:text-[#111318]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-[#EAD3A1]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
