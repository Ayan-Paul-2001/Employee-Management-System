'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/lib/auth-context';
import { Attendance } from '@/services/attendance.service';
import { useRouter } from 'next/navigation';

export default function AttendanceApprovalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const userRole = user?.role?.toLowerCase();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  const { pendingAttendances, loading, error, fetchPendingAttendances, approveAttendance } = useAttendance();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isAdminOrHR) {
      router.push('/dashboard');
      return;
    }
    fetchPendingAttendances();
  }, [isAdminOrHR]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleApprove = async (attendance: Attendance) => {
    if (!user?.id) return;
    setProcessingId(attendance.id);
    try {
      await approveAttendance(attendance.id, 'approve', user.id);
      setToast({ type: 'success', message: 'Attendance approved successfully.' });
      await fetchPendingAttendances();
    } catch {
      setToast({ type: 'error', message: 'Failed to approve attendance.' });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedAttendance || !user?.id) return;
    setProcessingId(selectedAttendance.id);
    try {
      await approveAttendance(selectedAttendance.id, 'reject', user.id, rejectionReason);
      setRejectDialogOpen(false);
      setToast({ type: 'success', message: 'Attendance rejected.' });
      await fetchPendingAttendances();
    } catch {
      setToast({ type: 'error', message: 'Failed to reject attendance.' });
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '—';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return timeStr; }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-white shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Approvals</h1>
        <button
          onClick={() => fetchPendingAttendances()}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {(!pendingAttendances || pendingAttendances.length === 0) ? (
        <div className="bg-white shadow p-10 text-center rounded-lg text-gray-500">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No pending attendance records. All caught up!</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingAttendances.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(att as any).employee?.fullName ||
                      `${(att as any).employee?.firstName || ''} ${(att as any).employee?.lastName || ''}`.trim() ||
                      `Employee #${att.employeeId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {att.date ? new Date(att.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatTime(att.checkInTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatTime(att.checkOutTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {att.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{att.notes || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(att)}
                        disabled={processingId === att.id}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-40"
                      >
                        {processingId === att.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openRejectDialog(att)}
                        disabled={processingId === att.id}
                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Attendance</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide an optional reason for rejection:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {processingId !== null ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}