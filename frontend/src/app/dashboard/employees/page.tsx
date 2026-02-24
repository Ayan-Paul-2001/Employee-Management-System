'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/lib/auth-context';

export default function EmployeesPage() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  const { employees, loading, error, fetchEmployees, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await deleteEmployee(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete employee.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        {isAdminOrHR && (
          <Link
            href="/dashboard/employees/add"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            + Add Employee
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, department, position..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex justify-between">
          <span>{error}</span>
          <button className="underline" onClick={() => fetchEmployees()}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white shadow p-8 text-center rounded-md text-gray-500">
          {searchTerm ? 'No employees match your search.' : 'No employees found. Add one to get started.'}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <li key={employee.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {employee.fullName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>

                  <div className="ml-4 min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-primary-700 truncate">{employee.fullName || 'No Name'}</p>
                      <p className="text-sm text-gray-500">{employee.email || 'No Email'}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {employee.position || '—'} • {employee.department || '—'}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {employee.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdminOrHR && (
                    <div className="ml-5 flex-shrink-0 flex items-center gap-3">
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                      >
                        View / Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(employee.id, employee.fullName || 'this employee')}
                        disabled={deletingId === employee.id}
                        className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-40"
                      >
                        {deletingId === employee.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}