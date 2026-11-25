export type UserRole = 'hr' | 'admin' | 'employee';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  employeeCode: string;
  department: string;
  position: string;
  phoneNumber?: string;
  address?: string;
  dateOfJoining?: string;
  isApproved: boolean;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface ApplicantItem extends User {
  reviewer?: Pick<User, 'id' | 'fullName' | 'email' | 'role'> | null;
}

export interface ApplicantsResponse {
  items: ApplicantItem[];
  pendingCount: number;
  rejectedCount: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string | User;
  user?: User | null;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  workHours: number;
  notes?: string;
  createdAt?: string;
}

export interface HrAnalyticsResponse {
  period: 'today' | 'week' | 'month';
  startDate: string;
  endDate: string;
  dateLabel: string;
  generatedAt: string;
  summary: {
    totalStaff: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    presentPercentage: number;
    absentPercentage: number;
  };
  pieData: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  staffBreakdown: Array<{
    id: string;
    fullName: string;
    email: string;
    employeeCode: string;
    role: UserRole;
    department: string;
    position: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workHours: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
  }>;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'annual' | 'sick' | 'casual' | 'emergency' | 'unpaid';

export interface LeaveRequestItem {
  id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  applicant?: User | null;
  reviewer?: Pick<User, 'id' | 'fullName' | 'email' | 'role'> | null;
}

export type NoticePriority = 'normal' | 'important' | 'urgent';
export type NoticeCategory = 'general' | 'policy' | 'event' | 'holiday' | 'hr';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: NoticePriority;
  category: NoticeCategory;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'employeeCode'> | null;
}

export interface NotificationItem {
  id: string;
  type:
    | 'user_registered'
    | 'leave_applied'
    | 'leave_reviewed'
    | 'notice_posted'
    | 'role_updated';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface MailRecipientItem {
  email: string;
  label: string;
  addedAt: string;
}

export interface NotificationMailSettings {
  enabled: boolean;
  recipients: MailRecipientItem[];
  updatedAt?: string;
}
