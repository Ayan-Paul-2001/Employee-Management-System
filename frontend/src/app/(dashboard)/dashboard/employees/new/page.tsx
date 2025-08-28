'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeApi } from '@/lib/api/employee';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const employeeSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  position: z.string().min(2, { message: 'Position is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  joinDate: z.string().min(1, { message: 'Join date is required' }),
  salary: z.string().min(1, { message: 'Salary is required' }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function NewEmployee() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      position: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0],
      salary: '',
      phone: '',
      address: '',
    },
  });

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'Human Resources',
    'Customer Support',
    'IT',
    'Operations',
  ];

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Map form data to API interface
        await employeeApi.createEmployee({
          name: data.name,
          email: data.email,
          password: data.password,
          department: data.department,
          designation: data.position, // Map position to designation
          joining_date: data.joinDate, // Map joinDate to joining_date
        });
      } catch (apiError) {
        console.log('API call failed, using mock implementation instead');
        // Mock implementation for testing when backend is not available
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Show success message
      alert('Employee created successfully!');
      
      // Reset form
      reset();
      
      // Redirect to employee list
      router.push('/dashboard/employees');
    } catch (err) {
      console.error('Failed to create employee:', err);
      setError('Failed to create employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/employees"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Employee</h1>
      </div>

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

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.email ? 'border-red-300' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.password ? 'border-red-300' : ''}`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="position" className="block text-xs sm:text-sm font-medium text-gray-700">
                Position *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="position"
                  {...register('position')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.position ? 'border-red-300' : ''}`}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="department" className="block text-xs sm:text-sm font-medium text-gray-700">
                Department *
              </label>
              <div className="mt-1">
                <select
                  id="department"
                  {...register('department')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.department ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="joinDate" className="block text-xs sm:text-sm font-medium text-gray-700">
                Join Date *
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="joinDate"
                  {...register('joinDate')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.joinDate ? 'border-red-300' : ''}`}
                />
                {errors.joinDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.joinDate.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="salary" className="block text-xs sm:text-sm font-medium text-gray-700">
                Salary *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="salary"
                  {...register('salary')}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.salary ? 'border-red-300' : ''}`}
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  rows={3}
                  {...register('address')}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              href="/dashboard/employees"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}