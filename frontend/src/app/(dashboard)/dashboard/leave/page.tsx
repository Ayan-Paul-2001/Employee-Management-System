'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
}

export default function LeavePage() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);

  // Mock data for employees
  const mockEmployees = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Michael Johnson' },
    { id: '4', name: 'Emily Brown' },
    { id: '5', name: 'David Wilson' },
  ];

  // Generate mock leave requests
  const generateMockLeaveRequests = () => {
    const requests: LeaveRequest[] = [];
    const leaveTypes: ('ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'OTHER')[] = 
      ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER'];
    const statuses: ('PENDING' | 'APPROVED' | 'REJECTED')[] = ['PENDING', 'APPROVED', 'REJECTED'];
    
    // Current date for reference
    const today = new Date();
    
    // For each employee
    mockEmployees.forEach(employee => {
      // Generate 1-3 leave requests per employee
      const numRequests = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numRequests; i++) {
        // Random leave type
        const randomType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
        
        // Random status
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Random start date (between today and 30 days from now)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        
        // Random end date (between start date and 7 days after start date)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1 + Math.floor(Math.random() * 7));
        
        // Random applied date (between 7 days ago and today)
        const appliedDate = new Date(today);
        appliedDate.setDate(today.getDate() - Math.floor(Math.random() * 7));
        
        requests.push({
          id: `leave-${employee.id}-${i}`,
          employeeId: employee.id,
          employeeName: employee.name,
          type: randomType,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          reason: `${randomType.toLowerCase()} leave request`,
          status: randomStatus,
          appliedDate: appliedDate.toISOString().split('T')[0],
        });
      }
    });
    
    return requests;
  };

  useEffect(() => {
    // In a real app, this would fetch data from the API
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees);
      setLeaveRequests(generateMockLeaveRequests());
      setLoading(false);
    }, 1000);
  }, []);

  // Filter leave requests based on filters
  const filteredRequests = leaveRequests.filter(request => {
    // Filter by employee if not 'all'
    if (selectedEmployee !== 'all' && request.employeeId !== selectedEmployee) {
      return false;
    }
    
    // Filter by status if not 'all'
    if (filter !== 'all' && request.status.toLowerCase() !== filter) {
      return false;
    }
    
    // For employees, only show their own requests
    if (user?.role === 'EMPLOYEE' && request.employeeId !== user?.id) {
      return false;
    }
    
    return true;
  });

  // Calculate leave duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  // Handle approve/reject leave request
  const handleLeaveAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll update the state directly
      setLeaveRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === id
            ? { ...request, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : request
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} leave request:`, err);
      alert(`Failed to ${action} leave request. Please try again.`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get leave type color
  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'ANNUAL': return 'bg-blue-100 text-blue-800';
      case 'SICK': return 'bg-red-100 text-red-800';
      case 'PERSONAL': return 'bg-purple-100 text-purple-800';
      case 'MATERNITY': return 'bg-pink-100 text-pink-800';
      case 'PATERNITY': return 'bg-indigo-100 text-indigo-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
        {user?.role === 'EMPLOYEE' && (
          <Link 
            href="/dashboard/leave/request"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Request Leave</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-md ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded-md ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Rejected
            </button>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
            <div className="flex items-center w-full sm:w-auto mt-2 sm:mt-0">
              <label htmlFor="employee" className="mr-2 text-sm font-medium text-gray-700">
                Employee:
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredRequests.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <li key={request.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                      </div>
                    )}
                    <div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(request.type)}`}>
                        {request.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex items-center text-sm text-gray-500 sm:mr-6 mb-2 sm:mb-0">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                      <span className="whitespace-nowrap">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({calculateDuration(request.startDate, request.endDate)} days)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                      <span>Applied on {new Date(request.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                    <p className="text-gray-700">{request.reason}</p>
                  </div>
                </div>
                
                {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && request.status === 'PENDING' && (
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleLeaveAction(request.id, 'reject')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleLeaveAction(request.id, 'approve')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No leave requests found
          </div>
        )}
      </div>

      {/* Leave Balance (for employees) */}
      {user?.role === 'EMPLOYEE' && (
        <div className="mt-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Leave Balance</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-4 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Annual Leave</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">14 days</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-4 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Sick Leave</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">10 days</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-4 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Personal Leave</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">3 days</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-4 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Used This Year</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                  {filteredRequests.filter(r => r.status === 'APPROVED').reduce((total, request) => {
                    return total + calculateDuration(request.startDate, request.endDate);
                  }, 0)} days
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}