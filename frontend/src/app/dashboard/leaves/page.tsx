'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeaves } from '@/hooks/useLeaves';
import { LeaveRequest } from '@/services/leave.service';
import { EmployeeService } from '@/services/employee.service';
import { z } from 'zod';

type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID' | 'OTHER';

const leaveRequestSchema = z.object({
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'OTHER']),
  employeeId: z.number().positive('Employee ID required'),
}).refine(
  (data) => new Date(data.toDate) >= new Date(data.fromDate),
  { message: 'End date must be after or equal to start date', path: ['toDate'] }
);

export default function LeavesPage() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: '',
    type: 'ANNUAL' as LeaveType,
    employeeId: 0,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const employeeService = new EmployeeService();

  useEffect(() => {
    const fetchEmpId = async () => {
      if (!user?.id) return;
      try {
        const empId = await employeeService.getEmployeeIdByUserId(user.id);
        setEmployeeId(empId);
        setFormData((prev) => ({ ...prev, employeeId: empId }));
      } catch {
        console.warn('Could not fetch employee ID for user', user.id);
      }
    };
    fetchEmpId();
  }, [user?.id]);

  const { leaves, loading, error, fetchLeaves, fetchEmployeeLeaves, fetchPendingLeaves, createLeaveRequest, approveLeave, rejectLeave } = useLeaves(user?.id);

  const handleStatusChange = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveLeave(id);
      } else {
        await rejectLeave(id);
      }
      // Refresh
      if (isAdminOrHR) {
        await fetchPendingLeaves();
      } else if (user?.id) {
        await fetchEmployeeLeaves(user.id.toString());
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update leave request.');
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...formData, employeeId: employeeId || formData.employeeId };
      const validated = leaveRequestSchema.parse(payload);
      setSubmitting(true);
      await createLeaveRequest(validated);
      setShowLeaveForm(false);
      setFormData({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: '',
        type: 'ANNUAL',
        employeeId: employeeId,
      });
      if (user?.id) await fetchEmployeeLeaves(user.id.toString());
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setFormError(err.issues.map((i) => i.message).join(' • '));
      } else {
        setFormError(err?.response?.data?.message || err.message || 'Failed to submit leave request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: LeaveRequest['status']) => {
    const map: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
        {/* Only employees (not HR/Admin) should request leave */}
        {!isAdminOrHR && (
          <button
            onClick={() => setShowLeaveForm(!showLeaveForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showLeaveForm ? 'Cancel' : 'Request Leave'}
          </button>
        )}
      </div>

      {/* Leave Request Form — Employees only */}
      {showLeaveForm && !isAdminOrHR && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Leave Request</h2>
          {formError && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border-l-4 border-red-400 rounded">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={(e) => setFormData((p) => ({ ...p, fromDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={(e) => setFormData((p) => ({ ...p, toDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as LeaveType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="PERSONAL">Personal Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-primary-500 focus:border-primary-500"
                placeholder="Reason for leave..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex justify-between">
          <span>{error}</span>
          <button className="underline" onClick={() => isAdminOrHR ? fetchPendingLeaves() : fetchLeaves()}>
            Retry
          </button>
        </div>
      )}

      {/* Leaves Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white shadow p-8 text-center rounded-md text-gray-500">
          No leave requests found.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdminOrHR && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {isAdminOrHR && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((request) => (
                <tr key={request.id}>
                  {isAdminOrHR && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(request as any).employeeName || `Employee #${request.employeeId}`}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.fromDate === request.toDate
                      ? request.fromDate
                      : `${request.fromDate} → ${request.toDate}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.type || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{request.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  {isAdminOrHR && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'PENDING' ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStatusChange(request.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}