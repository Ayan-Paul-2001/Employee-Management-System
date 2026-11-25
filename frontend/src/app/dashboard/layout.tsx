'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Megaphone,
  Users,
  UserCheck,
  MailCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { preloadWorkspace } from '@/lib/cache';
import { BrandLogo } from '@/components/BrandLogo';
import { AvatarCircle, RoleBadge } from '@/components/Badges';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'hr' | 'admin' | 'employee'>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['hr', 'admin', 'employee'],
  },
  {
    label: 'Attendance',
    href: '/dashboard/attendance',
    icon: Clock,
    roles: ['hr', 'admin', 'employee'],
  },
  {
    label: 'Leave Requests',
    href: '/dashboard/leaves',
    icon: CalendarDays,
    roles: ['hr', 'admin', 'employee'],
  },
  {
    label: 'Notice Board',
    href: '/dashboard/notices',
    icon: Megaphone,
    roles: ['hr', 'admin', 'employee'],
  },
  {
    label: 'Team & Roles',
    href: '/dashboard/team',
    icon: Users,
    roles: ['hr', 'admin'],
  },
  {
    label: 'Approvals',
    href: '/dashboard/approvals',
    icon: UserCheck,
    roles: ['hr', 'admin'],
  },
  {
    label: 'Notification Mail',
    href: '/dashboard/notification-mail',
    icon: MailCheck,
    roles: ['hr'],
  },
  {
    label: 'Profile & Security',
    href: '/dashboard/profile',
    icon: UserCircle,
    roles: ['hr', 'admin', 'employee'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const needsApproval =
    user &&
    user.role !== 'hr' &&
    (user.approvalStatus === 'pending' ||
      user.approvalStatus === 'rejected' ||
      user.isApproved === false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && needsApproval) {
      router.replace('/pending-approval');
    } else if (user && !needsApproval) {
      preloadWorkspace(user);
    }
  }, [user, loading, needsApproval, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user || needsApproval) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F5F1]">
        <BrandLogo variant="light" />
        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#6B6E76]">
          <span className="h-2 w-2 animate-ping rounded-full bg-[#C9A25B]" />
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const activeItem =
    allowedNav.find((item) =>
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href),
    ) || allowedNav[0];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#090B10] text-[#D8D6D0]">
      {/* Brand */}
      <div className="flex h-[74px] items-center justify-between border-b border-white/[0.06] px-5">
        <Link href="/dashboard" className="focus:outline-none">
          <BrandLogo variant="dark" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-[#8A8E99] hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3.5 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#666A75]">
          Navigation
        </p>
        {allowedNav.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition ${
                isActive
                  ? 'bg-white/[0.08] font-semibold text-[#FAF8F5] ring-1 ring-[#C9A25B]/25'
                  : 'text-[#8E93A0] hover:bg-white/[0.04] hover:text-[#FAF8F5]'
              }`}
            >
              {isActive && (
                <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-[#D8B46D]" />
              )}
              <Icon
                className={`h-[17px] w-[17px] shrink-0 transition ${
                  isActive
                    ? 'text-[#EAD3A1]'
                    : 'text-[#666B77] group-hover:text-[#D8D6D0]'
                }`}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-3">
            <AvatarCircle name={user.fullName} role={user.role} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#FAF8F5]">
                {user.fullName}
              </p>
              <p className="truncate font-mono text-[11px] text-[#C9A25B]">
                {user.employeeCode} • {user.role.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#D0D2D9] transition hover:border-rose-400/35 hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F6F5F1]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-[272px] shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 z-30 w-[272px]">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#090B10]/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Frosted Porcelain Topbar */}
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#E6E3DA] bg-[#F6F5F1]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DFD6] bg-white text-[#3F424A] hover:bg-[#FAF9F5] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-lg font-bold text-[#111318] sm:text-xl">
                {activeItem?.label || 'Dashboard'}
              </h1>
              <p className="hidden text-xs text-[#73767E] sm:block">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden md:block">
              <RoleBadge role={user.role} />
            </div>
            <NotificationBell />
            <Link
              href="/dashboard/profile"
              className="hidden items-center gap-2.5 rounded-xl border border-[#E2DFD6] bg-white py-1.5 pr-3.5 pl-1.5 shadow-2xs transition hover:border-[#CFCAC0] sm:flex"
            >
              <AvatarCircle name={user.fullName} role={user.role} size="sm" />
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-[#111318]">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-[#73767E]">{user.department}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DFD6] bg-white text-[#52555E] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Sign out"
            >
              <LogOut className="h-[17px] w-[17px]" />
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
