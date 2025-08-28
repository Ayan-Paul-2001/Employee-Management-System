import apiClient from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  email: string;
  code?: string;
  newPassword?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  verifyEmail: async (data: VerifyEmailData) => {
    const response = await apiClient.post('/auth/verify', data);
    return response.data;
  },
  
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/requestreset', { email });
    return response.data;
  },
  
  verifyResetCode: async (data: { email: string, code: string }) => {
    const response = await apiClient.post('/auth/verifyresetcode', data);
    return response.data;
  },
  
  resetPassword: async (data: { email: string, newPassword: string }) => {
    const response = await apiClient.post('/auth/resetpassword', data);
    return response.data;
  },
};