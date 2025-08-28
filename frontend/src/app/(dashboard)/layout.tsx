'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Providers } from './providers';
import { useAuth } from '@/lib/hooks/useAuth';

// Icons
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  BarChart2
} from 'lucide-react';

// Create a separate component for the dashboard content that will be used inside Providers
function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth(); // This is safe because it's wrapped in Providers

  // Define navigation items based on user role
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Employees', href: '/dashboard/employees', icon: Users, roles: ['ADMIN', 'HR_MANAGER'] },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Calendar, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Leave Management', href: '/dashboard/leave', icon: ClipboardList, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Bell, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart2, roles: ['ADMIN', 'HR_MANAGER'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = user?.role 
    ? navigation.filter(item => item.roles.includes(user.role))
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen ? (
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">EMS</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname === item.href
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`mr-3 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6 ${
                          pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex-shrink-0 group block w-full flex items-center"
                >
                  <div className="flex items-center">
                    <div>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.name || 'User'}
                      </p>
                      <div className="flex items-center text-xs sm:text-sm font-medium text-gray-500 group-hover:text-gray-700">
                        <LogOut className="mr-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        Sign out
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
            <span className="ml-2 text-lg sm:text-xl font-medium text-gray-900 inline-flex items-center">EMS</span>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">EMS</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    <LogOut className="mr-1 h-3 w-3" aria-hidden="true" />
                    Sign out
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-6 sm:pb-8">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardContent>{children}</DashboardContent>
    </Providers>
  );
}