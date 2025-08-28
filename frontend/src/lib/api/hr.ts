import apiClient from './axios';

export interface LeaveRequest {
  id: number;
  employee: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  review_date: string;
  rating: number;
  comments: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export const hrApi = {
  getAllEmployees: async () => {
    const response = await apiClient.get('/hr/employees');
    return response.data;
  },
  
  updateEmployee: async (id: number, data: any) => {
    const response = await apiClient.patch(`/hr/employees/${id}`, data);
    return response.data;
  },
  
  getAllLeaveRequests: async () => {
    const response = await apiClient.get('/hr/leave-requests');
    return response.data;
  },
  
  approveOrRejectLeave: async (id: number, status: 'Approved' | 'Rejected') => {
    const response = await apiClient.patch(`/hr/leave-requests/${id}`, { status });
    return response.data;
  },
  
  addPerformanceReview: async (data: { employee_id: number, rating: number, comments: string }) => {
    const response = await apiClient.post('/hr/reviews', data);
    return response.data;
  },
  
  getEmployeeReviews: async (employeeId: number) => {
    const response = await apiClient.get(`/hr/reviews/${employeeId}`);
    return response.data;
  },
  
  postAnnouncement: async (data: { title: string, content: string }) => {
    const response = await apiClient.post('/hr/announcements', data);
    return response.data;
  },
  
  getAllAnnouncements: async () => {
    const response = await apiClient.get('/hr/announcements');
    return response.data;
  },
  
  onboardEmployee: async (data: any) => {
    const response = await apiClient.post('/hr/employees', data);
    return response.data;
  },
};