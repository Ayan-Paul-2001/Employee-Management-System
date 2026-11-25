'use client';

import React from 'react';
import { Crown, Shield, User as UserIcon } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'hr') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF3E3] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#855E1F] ring-1 ring-inset ring-[#DFC48E]">
        <Crown className="h-3 w-3 text-[#B68938]" />
        HR Super Admin
      </span>
    );
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF7F6] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#0F5E59] ring-1 ring-inset ring-[#B4DCD8]">
        <Shield className="h-3 w-3 text-[#0D7C75]" />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F1EC] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#42454D] ring-1 ring-inset ring-[#DDDAD0]">
      <UserIcon className="h-3 w-3 text-[#6B6E76]" />
      Employee
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || '').toLowerCase();
  const map: Record<string, { label: string; classes: string; dot: string }> = {
    present: {
      label: 'Present',
      classes: 'bg-[#ECF8F3] text-[#0D6A4E] ring-[#B6E2D1]',
      dot: 'bg-[#0F8A64]',
    },
    approved: {
      label: 'Approved',
      classes: 'bg-[#ECF8F3] text-[#0D6A4E] ring-[#B6E2D1]',
      dot: 'bg-[#0F8A64]',
    },
    absent: {
      label: 'Absent',
      classes: 'bg-[#FDF1F3] text-[#9F1239] ring-[#F5C2CE]',
      dot: 'bg-[#BE123C]',
    },
    rejected: {
      label: 'Rejected',
      classes: 'bg-[#FDF1F3] text-[#9F1239] ring-[#F5C2CE]',
      dot: 'bg-[#BE123C]',
    },
    urgent: {
      label: 'Urgent',
      classes: 'bg-[#FDF1F3] text-[#9F1239] ring-[#F5C2CE]',
      dot: 'bg-[#BE123C]',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-[#FBF4E4] text-[#925E14] ring-[#EAD09B]',
      dot: 'bg-[#C48B2B]',
    },
    late: {
      label: 'Late',
      classes: 'bg-[#FBF4E4] text-[#925E14] ring-[#EAD09B]',
      dot: 'bg-[#C48B2B]',
    },
    important: {
      label: 'Important',
      classes: 'bg-[#FBF4E4] text-[#925E14] ring-[#EAD09B]',
      dot: 'bg-[#C48B2B]',
    },
    on_leave: {
      label: 'On Leave',
      classes: 'bg-[#EEF2FA] text-[#274472] ring-[#C5D3EB]',
      dot: 'bg-[#365C99]',
    },
    half_day: {
      label: 'Half Day',
      classes: 'bg-[#F3F0FA] text-[#553C9A] ring-[#D6C9F0]',
      dot: 'bg-[#6B46C1]',
    },
    normal: {
      label: 'Standard',
      classes: 'bg-[#F2F1EC] text-[#4E5159] ring-[#DCD9CE]',
      dot: 'bg-[#868991]',
    },
  };

  const cfg = map[normalized] || {
    label: status.replace('_', ' '),
    classes: 'bg-[#F2F1EC] text-[#4E5159] ring-[#DCD9CE]',
    dot: 'bg-[#868991]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function AvatarCircle({
  name,
  role,
  size = 'md',
}: {
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = (name || 'NH')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8 text-[11px]'
      : size === 'lg'
        ? 'h-14 w-14 text-lg'
        : 'h-9 w-9 text-xs';

  const colorClass =
    role === 'hr'
      ? 'bg-gradient-to-br from-[#1C2130] to-[#0B0E14] text-[#EAD3A1] ring-1 ring-[#C9A25B]/50'
      : role === 'admin'
        ? 'bg-gradient-to-br from-[#134E4A] to-[#0B302E] text-[#CCFBF1]'
        : 'bg-gradient-to-br from-[#2B3345] to-[#171C28] text-[#FAF8F5]';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-heading font-bold tracking-wider shadow-xs ${sizeClass} ${colorClass}`}
    >
      {initials || 'NH'}
    </div>
  );
}
