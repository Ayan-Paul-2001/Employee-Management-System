'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
}

import Unauthorized from '@/components/unauthorized';

export default function AttendancePage() {
  const { user } = useAuth();

  if (!user || !['EMPLOYEE', 'HR_MANAGER', 'ADMIN'].includes(user.role)) {
    return <Unauthorized />;
  }

  // Employee-specific logic
  const employeeView = user.role === 'EMPLOYEE' && (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Your Attendance Records</h2>
      {/* Employee-specific attendance UI */}
    </div>
  );

  // HR/Admin logic
  const managementView = ['HR_MANAGER', 'ADMIN'].includes(user.role) && (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Team Attendance Overview</h2>
      {/* Management UI */}
    </div>
  );

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'month'>('day');
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

  // Generate mock attendance data
  const generateMockAttendance = () => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Last 30 days

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
      
      // For each employee
      mockEmployees.forEach(employee => {
        // Random status
        const statuses: ('PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY')[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];
        const randomStatus = statuses[Math.floor(Math.random() * 10)] || 'PRESENT'; // Make PRESENT more likely
        
        // Random check-in time between 8:00 AM and 10:00 AM
        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
        
        // Random check-out time between 5:00 PM and 7:00 PM
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOut = randomStatus !== 'ABSENT' ? 
          `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}` : 
          null;
        
        records.push({
          id: `${employee.id}-${currentDate.toISOString().split('T')[0]}`,
          employeeId: employee.id,
          employeeName: employee.name,
          date: currentDate.toISOString().split('T')[0],
          checkIn: randomStatus !== 'ABSENT' ? checkIn : '',
          checkOut,
          status: randomStatus
        });
      });
    }
    
    return records;
  };

  useEffect(() => {
    // In a real app, this would fetch data from the API
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees);
      setAttendanceRecords(generateMockAttendance());
      setLoading(false);
    }, 1000);
  }, []);

  // Filter records based on current view and filters
  const filteredRecords = attendanceRecords.filter(record => {
    // Filter by employee if not 'all'
    if (selectedEmployee !== 'all' && record.employeeId !== selectedEmployee) {
      return false;
    }
    
    // Filter by date based on view
    const recordDate = new Date(record.date);
    if (view === 'day') {
      return recordDate.toDateString() === currentDate.toDateString();
    } else if (view === 'month') {
      return recordDate.getMonth() === currentDate.getMonth() && 
             recordDate.getFullYear() === currentDate.getFullYear();
    }
    
    return true;
  });

  // Navigate to previous/next day or month
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Format date for display
  const formatDate = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'HALF_DAY': return 'bg-orange-100 text-orange-800';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
        {user?.role === 'EMPLOYEE' && (
          <Link 
            href="/dashboard/attendance/record"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
            Record Attendance
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md flex-1 sm:flex-none text-center ${view === 'day' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Day View
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md flex-1 sm:flex-none text-center ${view === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Month View
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => navigate('prev')}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="text-gray-700 font-medium text-sm sm:text-base">{formatDate()}</span>
            <button
              onClick={() => navigate('next')}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
            <div className="flex items-center w-full sm:w-auto">
              <label htmlFor="employee" className="mr-2 text-sm font-medium text-gray-700">
                Employee:
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm w-full"
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

      {/* Attendance Records - Desktop */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                // Calculate hours worked
                let hoursWorked = '-';
                if (record.checkIn && record.checkOut) {
                  const [checkInHour, checkInMinute] = record.checkIn.split(':').map(Number);
                  const [checkOutHour, checkOutMinute] = record.checkOut.split(':').map(Number);
                  const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  hoursWorked = `${hours}h ${minutes}m`;
                }
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                        <div className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.checkIn ? record.checkIn : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.checkOut ? record.checkOut : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hoursWorked}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Attendance Records - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            // Calculate hours worked
            let hoursWorked = '-';
            if (record.checkIn && record.checkOut) {
              const [checkInHour, checkInMinute] = record.checkIn.split(':').map(Number);
              const [checkOutHour, checkOutMinute] = record.checkOut.split(':').map(Number);
              const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              hoursWorked = `${hours}h ${minutes}m`;
            }
            
            return (
              <div key={record.id} className="bg-white shadow rounded-lg p-4">
                {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
                  <div className="font-medium text-gray-900 mb-2">{record.employeeName}</div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Check In:</span>
                    <div className="mt-1">{record.checkIn ? record.checkIn : '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Check Out:</span>
                    <div className="mt-1">{record.checkOut ? record.checkOut : '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Hours:</span>
                    <div className="mt-1">{hoursWorked}</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow rounded-lg p-4 text-center text-sm text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Summary Stats (for month view) */}
      {view === 'month' && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-2 sm:p-3">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Present Days</dt>
                  <dd className="text-base sm:text-lg font-semibold text-gray-900">
                    {filteredRecords.filter(r => r.status === 'PRESENT').length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-2 sm:p-3">
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Absent Days</dt>
                  <dd className="text-base sm:text-lg font-semibold text-gray-900">
                    {filteredRecords.filter(r => r.status === 'ABSENT').length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2 sm:p-3">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Late Days</dt>
                  <dd className="text-base sm:text-lg font-semibold text-gray-900">
                    {filteredRecords.filter(r => r.status === 'LATE').length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 sm:p-3">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-base sm:text-lg font-semibold text-gray-900">
                    {filteredRecords.length > 0 ? 
                      `${Math.round((filteredRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length / filteredRecords.length) * 100)}%` : 
                      '0%'}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}