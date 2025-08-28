'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Users, Calendar, ClipboardList, Bell, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  href: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll simulate loading and then set mock data
    const timer = setTimeout(() => {
      if (user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') {
        setStats([
          {
            title: 'Total Employees',
            value: 124,
            icon: Users,
            change: 12,
            href: '/dashboard/employees'
          },
          {
            title: 'Present Today',
            value: '92%',
            icon: Calendar,
            change: 3,
            href: '/dashboard/attendance'
          },
          {
            title: 'Pending Leaves',
            value: 8,
            icon: ClipboardList,
            change: -2,
            href: '/dashboard/leave'
          },
          {
            title: 'Announcements',
            value: 5,
            icon: Bell,
            change: 0,
            href: '/dashboard/announcements'
          },
        ]);
      } else {
        // Employee view
        setStats([
          {
            title: 'My Attendance',
            value: '96%',
            icon: Calendar,
            change: 2,
            href: '/dashboard/attendance'
          },
          {
            title: 'Leave Balance',
            value: '14 days',
            icon: ClipboardList,
            change: 0,
            href: '/dashboard/leave'
          },
          {
            title: 'Announcements',
            value: 5,
            icon: Bell,
            change: 0,
            href: '/dashboard/announcements'
          },
        ]);
      }

      setRecentAnnouncements([
        {
          id: 1,
          title: 'Company Picnic Next Month',
          content: 'Join us for our annual company picnic on July 15th at Riverside Park.',
          date: '2023-06-10',
        },
        {
          id: 2,
          title: 'New Health Insurance Policy',
          content: 'Our health insurance policy has been updated. Please review the new terms.',
          date: '2023-06-05',
        },
        {
          id: 3,
          title: 'Office Closure Notice',
          content: 'The office will be closed on June 19th for building maintenance.',
          date: '2023-06-01',
        },
      ]);
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'User'}!
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link href={stat.href} key={stat.title}>
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 sm:p-3">
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-4 sm:ml-5 w-0 flex-1">
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</div>
                        {stat.change !== undefined && (
                          <div className={`ml-2 flex items-baseline text-xs sm:text-sm font-semibold ${stat.change > 0 ? 'text-green-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {stat.change > 0 ? (
                              <ArrowUp className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-green-500" aria-hidden="true" />
                            ) : stat.change < 0 ? (
                              <ArrowDown className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-red-500" aria-hidden="true" />
                            ) : null}
                            <span className="sr-only">
                              {stat.change > 0 ? 'Increased' : stat.change < 0 ? 'Decreased' : 'No change'} by
                            </span>
                            {Math.abs(stat.change)}%
                          </div>
                        )}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Announcements</h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentAnnouncements.map((announcement) => (
              <li key={announcement.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <p className="text-sm font-medium text-blue-600 truncate">{announcement.title}</p>
                    <div className="flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-none">{announcement.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-3 text-center sm:text-right sm:px-6">
            <Link 
              href="/dashboard/announcements"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all announcements
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(user?.role === 'ADMIN' || user?.role === 'HR_MANAGER') && (
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/employees/new">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Add New Employee</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/announcements/new">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Post Announcement</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/reports">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Generate Reports</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Employee Quick Actions */}
      {user?.role === 'EMPLOYEE' && (
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/attendance/record">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Record Attendance</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/leave/request">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Request Leave</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/profile">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:py-5 sm:p-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" aria-hidden="true" />
                    <div className="ml-3 text-xs sm:text-sm font-medium text-gray-900">Update Profile</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}