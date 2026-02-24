'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useNotices } from '@/hooks/useNotices';
import { z } from 'zod';

const noticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Content must be at least 10 characters'),
  expiresAt: z.string().optional(),
});

export default function NoticesPage() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', body: '', expiresAt: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { notices, loading, error, fetchNotices, createNotice, updateNotice, deleteNotice } = useNotices();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return dateString; }
  };

  const resetForm = () => {
    setFormData({ title: '', body: '', expiresAt: '' });
    setFormError('');
    setShowNoticeForm(false);
    setEditingNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const validated = noticeSchema.parse(formData);
      setSubmitting(true);
      if (editingNotice !== null) {
        await updateNotice(editingNotice, validated);
      } else {
        await createNotice(validated);
      }
      resetForm();
      await fetchNotices();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setFormError(err.issues.map((i) => i.message).join(' • '));
      } else {
        setFormError(err?.response?.data?.message || err.message || 'Failed to save notice.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (notice: any) => {
    setEditingNotice(notice.id);
    setFormData({
      title: notice.title,
      body: notice.body,
      expiresAt: notice.expiresAt ? notice.expiresAt.split('T')[0] : '',
    });
    setShowNoticeForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete notice.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notices</h1>
        {isAdminOrHR && !showNoticeForm && (
          <button
            onClick={() => { setShowNoticeForm(true); setEditingNotice(null); setFormData({ title: '', body: '', expiresAt: '' }); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            + Post Notice
          </button>
        )}
      </div>

      {/* Notice Form for Admin/HR */}
      {isAdminOrHR && showNoticeForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingNotice !== null ? 'Edit Notice' : 'Post New Notice'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-sm text-red-700">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                placeholder="Notice title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                placeholder="Notice content..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingNotice !== null ? 'Update Notice' : 'Post Notice')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex justify-between">
          <span>{error}</span>
          <button className="underline" onClick={() => fetchNotices()}>Retry</button>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white shadow p-10 text-center rounded-md text-gray-500">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          No notices available.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{notice.title}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Posted on {formatDate(notice.createdAt || notice.publishedAt)}
                      {notice.expiresAt && ` • Expires ${formatDate(notice.expiresAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {notice.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    )}
                    {isAdminOrHR && (
                      <>
                        <button
                          onClick={() => handleEdit(notice)}
                          className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}