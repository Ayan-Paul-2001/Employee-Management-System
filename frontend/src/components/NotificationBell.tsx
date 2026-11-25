'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  UserPlus,
  CalendarClock,
  Megaphone,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { NotificationItem } from '@/lib/types';

function formatRelativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<{ items: NotificationItem[]; unreadCount: number }>(
        '/notifications',
      );
      setItems(res.data.items || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // ignore transient errors
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'user_registered':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E3] text-[#9A7432]">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      case 'leave_applied':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FBF4E4] text-[#B45309]">
            <CalendarClock className="h-4 w-4" />
          </div>
        );
      case 'leave_reviewed':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ECF8F3] text-[#0D6A4E]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        );
      case 'role_updated':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#121722] text-[#EAD3A1]">
            <Crown className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F2F1EC] text-[#52555E]">
            <Megaphone className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        aria-label="Open notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DFD6] bg-white text-[#52555E] shadow-2xs transition hover:border-[#CFCAC0] hover:text-[#111318]"
      >
        <Bell className="h-[17px] w-[17px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BE123C] px-1 font-mono text-[10px] font-bold text-white ring-2 ring-[#F6F5F1]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2.5 w-80 overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white shadow-2xl shadow-black/15 sm:w-96">
          <div className="flex items-center justify-between border-b border-[#EFECE5] px-4 py-3.5">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#111318]">
                Activity &amp; Alerts
              </h3>
              <p className="text-xs text-[#73767E]">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#9A7432] transition hover:bg-[#FAF3E3]"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 divide-y divide-[#F2EFE8] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-[#D4D0C5]" />
                <p className="text-sm font-medium text-[#52555E]">
                  No notifications yet
                </p>
                <p className="mt-0.5 text-xs text-[#8E919A]">
                  Registrations, leave updates, and notices appear here.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAF9F5] ${
                    !n.isRead ? 'bg-[#FDFBF5]' : 'bg-white'
                  }`}
                >
                  {renderIcon(n.type)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#111318]">
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-[#8E919A]">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5C5F66]">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C9A25B]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
