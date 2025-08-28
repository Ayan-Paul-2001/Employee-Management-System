import apiClient from './axios';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  joining_date: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  joining_date: string;
}

export interface UpdateEmployeeData {
  name?: string;
  department?: string;
  designation?: string;
}

export const employeeApi = {
  getAllEmployees: async () => {
    const response = await apiClient.get('/employee/all');
    return response.data;
  },
  
  getEmployeeById: async (id: number) => {
    const response = await apiClient.get(`/employee/${id}`);
    return response.data;
  },
  
  createEmployee: async (data: CreateEmployeeData) => {
    const response = await apiClient.post('/employee/create', data);
    return response.data;
  },
  
  updateEmployee: async (id: number, data: UpdateEmployeeData) => {
    const response = await apiClient.patch(`/employee/update/${id}`, data);
    return response.data;
  },
  
  deleteEmployee: async (id: number) => {
    const response = await apiClient.delete(`/employee/delete/${id}`);
    return response.data;
  },
  
  requestLeave: async (data: { start_date: string, end_date: string, reason: string }) => {
    const response = await apiClient.post('/employee/leave', data);
    return response.data;
  },
  
  recordAttendance: async (data: { date: string, status: 'Present' | 'Absent' | 'Late' }) => {
    const response = await apiClient.post('/employee/attendance', data);
    return response.data;
  },
};