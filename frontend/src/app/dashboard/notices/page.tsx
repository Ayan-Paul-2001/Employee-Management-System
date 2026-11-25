'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Edit3,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { getCached, setCached, invalidateCache } from '@/lib/cache';
import type { NoticeCategory, NoticeItem, NoticePriority } from '@/lib/types';
import { RoleBadge, StatusBadge } from '@/components/Badges';

export default function NoticesPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'hr' || user?.role === 'admin';

  const cachedNotices = user ? getCached<NoticeItem[]>(`${user.id}:notices`) : null;
  const [notices, setNotices] = useState<NoticeItem[]>(cachedNotices || []);
  const [loading, setLoading] = useState(!cachedNotices);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoticeItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('normal');
  const [category, setCategory] = useState<NoticeCategory>('general');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    const key = `${user?.id || 'anon'}:notices`;
    const cached = getCached<NoticeItem[]>(key);
    if (cached) {
      setNotices(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await api.get<NoticeItem[]>('/notices');
      setNotices(res.data || []);
      setCached(key, res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openCreateModal = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setPriority('normal');
    setCategory('general');
    setPinned(false);
    setModalOpen(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setEditing(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setCategory(notice.category);
    setPinned(notice.pinned);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.patch(`/notices/${editing.id}`, {
          title: title.trim(),
          content: content.trim(),
          priority,
          category,
          pinned,
        });
        toast.success('Notice updated.');
      } else {
        await api.post('/notices', {
          title: title.trim(),
          content: content.trim(),
          priority,
          category,
          pinned,
        });
        toast.success('Notice published to all employees.');
      }
      setModalOpen(false);
      invalidateCache('notices');
      invalidateCache('overview');
      await fetchNotices();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save notice'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (notice: NoticeItem) => {
    try {
      await api.patch(`/notices/${notice.id}`, { pinned: !notice.pinned });
      toast.success(notice.pinned ? 'Notice unpinned' : 'Notice pinned');
      await fetchNotices();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update notice'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Notice deleted.');
      await fetchNotices();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete notice'));
    }
  };

  const filtered = notices.filter((n) => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#111318]">
            Company Notice Board
          </h2>
          <p className="mt-0.5 text-sm text-[#6B6E76]">
            {canManage
              ? 'Publish official updates, HR policies, and announcements for employees.'
              : 'Stay informed with official announcements from HR & Admin.'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="nh-btn-primary px-4 py-2.5 text-xs"
          >
            <Plus className="h-4 w-4 text-[#EAD3A1]" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'hr', 'policy', 'event', 'holiday', 'general'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                categoryFilter === cat
                  ? 'bg-[#0A0D14] text-[#FAF8F5]'
                  : 'border border-[#E2DFD6] bg-white text-[#5C5F66] hover:bg-[#FAF9F5]'
              }`}
            >
              {cat === 'hr' ? 'HR' : cat}
            </button>
          ))}
        </div>

        <div className="nh-field-box !w-full sm:!w-68">
          <Search className="h-4 w-4 shrink-0 text-[#8B8982]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="nh-field-input !py-2 !text-xs"
          />
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="nh-card px-6 py-12 text-center text-sm text-[#8E919A]">
          Loading notices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="nh-card px-6 py-14 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-[#D5D1C7]" />
          <p className="text-sm font-semibold text-[#52555E]">
            No notices available
          </p>
          <p className="mt-1 text-xs text-[#8E919A]">
            {canManage
              ? 'Click "Publish Notice" to share an announcement with your team.'
              : 'Announcements from HR and Admin will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((notice) => (
            <article
              key={notice.id}
              className={`nh-card nh-card-hover p-6 ${
                notice.pinned ? 'border-[#DFC48E] bg-[#FFFDF8]' : ''
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E3] px-2.5 py-0.5 text-[11px] font-bold text-[#855E1F] ring-1 ring-[#E4CFA0]">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                    <StatusBadge status={notice.priority} />
                    <span className="rounded-full bg-[#F4F2EC] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[#5C5F66]">
                      {notice.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#111318]">
                    {notice.title}
                  </h3>
                </div>

                {canManage && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(notice)}
                      title={notice.pinned ? 'Unpin' : 'Pin notice'}
                      className={`rounded-xl border p-2 transition ${
                        notice.pinned
                          ? 'border-[#DFC48E] bg-[#FAF3E3] text-[#9A7432]'
                          : 'border-[#E2DFD6] bg-white text-[#6B6E76] hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(notice)}
                      title="Edit notice"
                      className="rounded-xl border border-[#E2DFD6] bg-white p-2 text-[#6B6E76] transition hover:bg-[#FAF9F5] hover:text-[#111318]"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id)}
                      title="Delete notice"
                      className="rounded-xl border border-[#E2DFD6] bg-white p-2 text-[#6B6E76] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#42454D]">
                {notice.content}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EDE6] pt-3.5 text-xs text-[#73767E]">
                <div className="flex items-center gap-2">
                  <span>Published by</span>
                  <strong className="text-[#111318]">
                    {notice.author?.fullName || 'Management'}
                  </strong>
                  {notice.author && <RoleBadge role={notice.author.role} />}
                </div>
                <span className="font-mono text-[11px] text-[#8E919A]">
                  {new Date(notice.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090B10]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EFECE5] px-6 py-4">
              <h3 className="font-heading text-lg font-bold text-[#111318]">
                {editing ? 'Edit Notice' : 'Publish New Notice'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8E919A] hover:bg-[#F4F2EC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Updated Holiday Calendar 2026"
                  className="nh-input"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    className="nh-input"
                  >
                    <option value="normal">Standard</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="nh-input"
                  >
                    <option value="general">General</option>
                    <option value="hr">HR</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your official notice..."
                  className="nh-input resize-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#42454D]">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CFCAC0] accent-[#0A0D14]"
                />
                Pin this notice to the top of the board
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#DFDCD2] px-4 py-2 text-xs font-semibold text-[#5C5F66] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="nh-btn-primary px-5 py-2.5 text-xs"
                >
                  {submitting
                    ? 'Publishing...'
                    : editing
                      ? 'Save Changes'
                      : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
