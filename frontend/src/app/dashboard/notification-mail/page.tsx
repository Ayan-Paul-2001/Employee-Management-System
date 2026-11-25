'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Mail,
  MailCheck,
  MailX,
  Plus,
  Trash2,
  Send,
  Tag,
  Power,
  CheckCircle2,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { getCached, setCached } from '@/lib/cache';
import type { NotificationMailSettings } from '@/lib/types';

export default function NotificationMailPage() {
  const { user } = useAuth();
  const router = useRouter();

  const cacheKey = user ? `${user.id}:notification-mail` : '';
  const initialCached = cacheKey
    ? getCached<NotificationMailSettings>(cacheKey)
    : null;

  const [settings, setSettings] = useState<NotificationMailSettings>(
    initialCached || { enabled: true, recipients: [] },
  );
  const [loading, setLoading] = useState(!initialCached);
  const [toggling, setToggling] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'hr') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const fetchSettings = useCallback(async () => {
    if (!user || user.role !== 'hr') return;
    try {
      const res = await api.get<NotificationMailSettings>('/notification-mail');
      setSettings(res.data);
      setCached(`${user.id}:notification-mail`, res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async () => {
    if (!user || toggling) return;
    const nextEnabled = !settings.enabled;
    setToggling(true);
    // Optimistic update
    setSettings((prev) => ({ ...prev, enabled: nextEnabled }));
    try {
      const res = await api.patch<NotificationMailSettings>(
        '/notification-mail/toggle',
        { enabled: nextEnabled },
      );
      setSettings(res.data);
      setCached(`${user.id}:notification-mail`, res.data);
      toast.success(
        nextEnabled
          ? 'Registration notification emails turned ON.'
          : 'Registration notification emails turned OFF.',
      );
    } catch (err) {
      setSettings((prev) => ({ ...prev, enabled: !nextEnabled }));
      toast.error(getApiErrorMessage(err, 'Failed to update mail toggle'));
    } finally {
      setToggling(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;

    setAdding(true);
    try {
      const res = await api.post<NotificationMailSettings>(
        '/notification-mail/recipients',
        {
          email: trimmed,
          label: newLabel.trim() || undefined,
        },
      );
      setSettings(res.data);
      setCached(`${user.id}:notification-mail`, res.data);
      setNewEmail('');
      setNewLabel('');
      toast.success(`${trimmed} added to registration alert recipients.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add email address'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRecipient = async (email: string) => {
    if (!user) return;
    setRemovingEmail(email);
    try {
      const res = await api.delete<NotificationMailSettings>(
        '/notification-mail/recipients',
        { params: { email } },
      );
      setSettings(res.data);
      setCached(`${user.id}:notification-mail`, res.data);
      toast.success(`${email} removed from mailing list.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove email'));
    } finally {
      setRemovingEmail(null);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await api.post<{ message: string }>('/notification-mail/test');
      toast.success(res.data?.message || 'Test alert email dispatched!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send test email'));
    } finally {
      setSendingTest(false);
    }
  };

  if (!user || user.role !== 'hr') return null;

  return (
    <div className="space-y-6">
      {/* Executive Midnight Onyx Control Banner */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0A0D14] p-6 text-[#FAF8F5] shadow-xl shadow-black/15 sm:p-7">
        <div className="nh-silk-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A25B]/15 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#0F766E]/15 blur-[80px]" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A25B]/30 bg-[#C9A25B]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#EAD3A1]">
                <Crown className="h-3.5 w-3.5" />
                HR Mail Dispatch Control
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  settings.enabled
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-rose-400/30 bg-rose-500/15 text-rose-200'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    settings.enabled ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {settings.enabled
                  ? 'Active — Registration Alerts ON'
                  : 'Paused — Registration Alerts OFF'}
              </span>
            </div>

            <h2 className="mt-4 font-heading text-2xl font-bold text-[#FAF8F5] sm:text-3xl">
              Notification{' '}
              <span className="font-editorial font-normal italic text-[#EAD3A1]">
                Mail Center
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#9FA4B0]">
              Control automated Nodemailer registration alerts. When enabled,
              every email address listed below receives an instant alert whenever
              a new employee signs up.
            </p>
          </div>

          {/* Master ON/OFF Toggle Card */}
          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 backdrop-blur-md sm:min-w-[270px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9A25B]">
                  Mail System
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {settings.enabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                aria-label="Toggle registration notification mail system"
                disabled={toggling || loading}
                onClick={handleToggle}
                className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A25B]/60 disabled:opacity-50 ${
                  settings.enabled
                    ? 'bg-emerald-500'
                    : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  <Power
                    className={`h-3.5 w-3.5 ${
                      settings.enabled ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs text-[#9FA4B0]">
              <span>Configured Recipients</span>
              <span className="font-mono font-bold text-[#EAD3A1]">
                {settings.recipients.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner when ON but no recipients added */}
      {settings.enabled && !loading && settings.recipients.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#EAD09B] bg-[#FBF4E4] px-5 py-3.5 text-xs font-medium text-[#855E1F]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#B45309]" />
          <span>
            Notification Mail is turned <strong>ON</strong>, but no recipient
            emails are listed yet. Add an email address below to start receiving
            registration alerts.
          </span>
        </div>
      )}

      {/* 2-Column Workspace: Add Recipient + Recipient Mailing List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Add Email Card */}
        <div className="nh-card p-6 lg:col-span-5">
          <div className="mb-5 border-b border-[#EFECE5] pb-4">
            <h3 className="font-heading text-base font-bold text-[#111318]">
              Add Recipient Email
            </h3>
            <p className="mt-0.5 text-xs text-[#73767E]">
              Added addresses automatically receive Nodemailer alerts on every
              new employee registration.
            </p>
          </div>

          <form onSubmit={handleAddRecipient} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Email Address
              </label>
              <div className="nh-field-box">
                <Mail className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="hr.alerts@company.com"
                  className="nh-field-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Label / Role Note (Optional)
              </label>
              <div className="nh-field-box">
                <Tag className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type="text"
                  maxLength={60}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. HR Director, Operations Admin"
                  className="nh-field-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="nh-btn-primary mt-1 w-full py-3 text-xs"
            >
              <Plus className="h-4 w-4 text-[#EAD3A1]" />
              {adding ? 'Adding Email...' : 'Add to Notification List'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-[#EAE7DF] bg-[#FAF9F5] p-4 text-xs leading-relaxed text-[#5C5F66]">
            <p className="font-bold text-[#111318]">How delivery works</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                When toggled <strong>ON</strong>, only emails in your recipient
                list receive registration alerts.
              </li>
              <li>
                When toggled <strong>OFF</strong>, registration emails are paused
                while dashboard bell alerts remain active.
              </li>
            </ul>
          </div>
        </div>

        {/* Recipient List Card */}
        <div className="nh-card flex flex-col overflow-hidden lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE5] px-6 py-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#111318]">
                Registration Alert Recipients
              </h3>
              <p className="text-xs text-[#73767E]">
                {settings.recipients.length} email
                {settings.recipients.length === 1 ? '' : 's'} configured for
                registration alerts
              </p>
            </div>

            {settings.enabled && settings.recipients.length > 0 && (
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTest}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFC48E] bg-[#FAF3E3] px-3.5 py-2 text-xs font-bold text-[#855E1F] transition hover:bg-[#F5E8C8] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {sendingTest ? 'Sending Test...' : 'Send Test Alert'}
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-[#F2EFE8]">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-[#8E919A]">
                Loading notification mail settings...
              </div>
            ) : settings.recipients.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <MailX className="mx-auto mb-3 h-10 w-10 text-[#D5D1C7]" />
                <p className="text-sm font-semibold text-[#52555E]">
                  No recipient emails added
                </p>
                <p className="mt-1 text-xs text-[#8E919A]">
                  Use the form on the left to add HR or Admin emails that should
                  receive new registration alerts.
                </p>
              </div>
            ) : (
              settings.recipients.map((item) => (
                <div
                  key={item.email}
                  className="flex flex-col gap-3 px-6 py-4 transition hover:bg-[#FAF9F5] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        settings.enabled
                          ? 'bg-[#ECF8F3] text-[#0F766E]'
                          : 'bg-[#F2F1EC] text-[#8E919A]'
                      }`}
                    >
                      <MailCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-mono text-sm font-semibold text-[#111318]">
                          {item.email}
                        </p>
                        {item.label && (
                          <span className="rounded-full bg-[#FAF3E3] px-2.5 py-0.5 text-[10.5px] font-bold text-[#855E1F] ring-1 ring-[#E4CFA0]">
                            {item.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8E919A]">
                        <CheckCircle2
                          className={`h-3 w-3 ${
                            settings.enabled
                              ? 'text-[#0F766E]'
                              : 'text-[#C4C1B8]'
                          }`}
                        />
                        <span>
                          {settings.enabled
                            ? 'Receiving registration alerts'
                            : 'Paused (mail system is OFF)'}
                        </span>
                        {item.addedAt && (
                          <span>
                            • Added{' '}
                            {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={removingEmail === item.email}
                    onClick={() => handleRemoveRecipient(item.email)}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[#E2DFD6] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C5F66] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 sm:self-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {removingEmail === item.email ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
