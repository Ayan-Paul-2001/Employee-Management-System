'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { invalidateCache } from './cache';
import type { User } from './types';

const USER_CACHE_KEY = 'nh_cached_user';

function readCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    department?: string;
    position?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setUser: React.Dispatch<React.SetStateAction<User | null>> = useCallback(
    (updater) => {
      setUserState((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater;
        writeCachedUser(next);
        return next;
      });
    },
    [],
  );

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get<User>('/auth/me');
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nh_access_token');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    // Instant non-blocking hydration from local cache, then silent background verification
    const cached = readCachedUser();
    const hasToken =
      typeof window !== 'undefined' && Boolean(localStorage.getItem('nh_access_token'));
    if (cached && hasToken) {
      setUserState(cached);
      setLoading(false);
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    invalidateCache();
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.accessToken && typeof window !== 'undefined') {
      localStorage.setItem('nh_access_token', res.data.accessToken);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    department?: string;
    position?: string;
  }): Promise<User> => {
    invalidateCache();
    const res = await api.post('/auth/register', payload);
    if (res.data?.accessToken && typeof window !== 'undefined') {
      localStorage.setItem('nh_access_token', res.data.accessToken);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear local session regardless
    } finally {
      invalidateCache();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nh_access_token');
      }
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
