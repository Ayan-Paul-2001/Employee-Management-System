import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nh_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        localStorage.removeItem('nh_access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(err: any, fallback = 'Something went wrong'): string {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  if (typeof msg === 'string' && msg.trim()) return msg;
  return err?.message || fallback;
}
