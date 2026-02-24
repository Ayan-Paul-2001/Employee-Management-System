'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/lib/auth-context';

export default function AttendancePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    attendances,
    loading,
    error,
    checkIn,
    checkOut,
    fetchEmployeeAttendance,
  } = useAttendance(user?.id);

  useEffect(() => {
    if (user?.id) {
      const [year, month] = selectedDate.split('-');
      fetchEmployeeAttendance(user.id, month, year);
    }
  }, [user?.id, selectedDate]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = attendances.some(
    (att) => new Date(att.date).toISOString().split('T')[0] === today && att.checkInTime
  );
  const hasCheckedOutToday = attendances.some(
    (att) => new Date(att.date).toISOString().split('T')[0] === today && att.checkOutTime
  );

  const handleCheckIn = async () => {
    setProcessing(true);
    try {
      await checkIn(checkInNotes);
      setToast({ type: 'success', message: 'Checked in successfully!' });
      setShowCheckInForm(false);
      setCheckInNotes('');
      const [year, month] = selectedDate.split('-');
      if (user?.id) fetchEmployeeAttendance(user.id, month, year);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to check in.';
      setToast({ type: 'error', message: msg });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setProcessing(true);
    try {
      await checkOut(checkOutNotes);
      setToast({ type: 'success', message: 'Checked out successfully!' });
      setShowCheckOutForm(false);
      setCheckOutNotes('');
      const [year, month] = selectedDate.split('-');
      if (user?.id) fetchEmployeeAttendance(user.id, month, year);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to check out.';
      setToast({ type: 'error', message: msg });
    } finally {
      setProcessing(false);
    }
  };

  const statusColors: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    HALF_DAY: 'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-white shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Attendance</h1>

      {/* Controls Row */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCheckInForm(!showCheckInForm); setShowCheckOutForm(false); }}
            disabled={hasCheckedInToday || loading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasCheckedInToday ? '✓ Checked In' : 'Check In'}
          </button>
          <button
            onClick={() => { setShowCheckOutForm(!showCheckOutForm); setShowCheckInForm(false); }}
            disabled={!hasCheckedInToday || hasCheckedOutToday || loading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasCheckedOutToday ? '✓ Checked Out' : 'Check Out'}
          </button>
        </div>
      </div>

      {/* Inline Check-In Form */}
      {showCheckInForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-4 border border-green-200">
          <h3 className="font-medium text-gray-900 mb-3">Check In</h3>
          <textarea
            value={checkInNotes}
            onChange={(e) => setCheckInNotes(e.target.value)}
            placeholder="Notes (optional)..."
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 mb-3"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCheckInForm(false)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckIn}
              disabled={processing}
              className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Checking in...' : 'Confirm Check In'}
            </button>
          </div>
        </div>
      )}

      {/* Inline Check-Out Form */}
      {showCheckOutForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-4 border border-red-200">
          <h3 className="font-medium text-gray-900 mb-3">Check Out</h3>
          <textarea
            value={checkOutNotes}
            onChange={(e) => setCheckOutNotes(e.target.value)}
            placeholder="Notes (optional)..."
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCheckOutForm(false)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckOut}
              disabled={processing}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? 'Checking out...' : 'Confirm Check Out'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.length > 0 ? (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[att.status] || 'bg-gray-100 text-gray-800'}`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{att.notes || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}