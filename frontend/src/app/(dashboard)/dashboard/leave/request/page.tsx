'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeApi } from '@/lib/api/employee';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

const leaveRequestSchema = z.object({
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER'], {
    required_error: 'Please select a leave type',
  }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters' }),
  documents: z.any().optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export default function RequestLeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      type: undefined,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const watchStartDate = watch('startDate');
  
  // Calculate the minimum end date based on the selected start date
  const minEndDate = watchStartDate || new Date().toISOString().split('T')[0];

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // In a real app, this would send the data to the API
      await employeeApi.requestLeave({
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      reset();
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/leave');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      setError('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/leave"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Request Leave</h1>
      </div>

      {success ? (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Leave Request Submitted
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Your leave request has been submitted successfully. You will be redirected to the leave management page shortly.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Leave Type *
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    {...register('type')}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.type ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Leave Type</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    {...register('startDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className={`pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.startDate ? 'border-red-300' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="date"
                    id="endDate"
                    {...register('endDate')}
                    min={minEndDate}
                    className={`pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.endDate ? 'border-red-300' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason *
                </label>
                <div className="mt-1">
                  <textarea
                    id="reason"
                    rows={4}
                    {...register('reason')}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.reason ? 'border-red-300' : ''}`}
                    placeholder="Please provide a detailed reason for your leave request"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700">
                  Supporting Documents (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="documents"
                    {...register('documents')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    multiple
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload any supporting documents (e.g., medical certificate for sick leave)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Link
                href="/dashboard/leave"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center sm:text-left"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Leave Policy Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Annual Leave</dt>
              <dd className="mt-1 text-sm text-gray-900">20 days per year</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Sick Leave</dt>
              <dd className="mt-1 text-sm text-gray-900">14 days per year</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Personal Leave</dt>
              <dd className="mt-1 text-sm text-gray-900">5 days per year</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Maternity Leave</dt>
              <dd className="mt-1 text-sm text-gray-900">12 weeks paid</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Paternity Leave</dt>
              <dd className="mt-1 text-sm text-gray-900">2 weeks paid</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Notice Period</dt>
              <dd className="mt-1 text-sm text-gray-900">2 weeks for planned leave</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}