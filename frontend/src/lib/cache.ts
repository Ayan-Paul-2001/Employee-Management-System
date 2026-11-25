import { api } from './api';
import type { User } from './types';

const memoryCache = new Map<string, { data: any; ts: number }>();
const preloadedUsers = new Set<string>();

const STORAGE_PREFIX = 'nh_swr_';

export function getCached<T>(key: string, maxAgeMs = 180_000): T | null {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem && now - mem.ts < maxAgeMs) {
    return mem.data as T;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && now - parsed.ts < maxAgeMs) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return null;
}

export function setCached<T>(key: string, data: T): void {
  const entry = { data, ts: Date.now() };
  memoryCache.set(key, entry);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // ignore quota errors
    }
  }
}

export function invalidateCache(substring?: string): void {
  if (!substring) {
    preloadedUsers.clear();
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (!substring || key.includes(substring)) {
      memoryCache.delete(key);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          if (!substring || k.includes(substring)) {
            keysToDelete.push(k);
          }
        }
      }
      keysToDelete.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Fan-out data from /dashboard/overview into every sub-page cache key so clicking
 * Notice Board, Leaves, Attendance, or Overview renders instantly with zero loading delay.
 */
export function seedCachesFromOverview(user: User, data: any): void {
  if (!user || !data) return;
  const uid = user.id;

  if (Array.isArray(data.notices)) {
    setCached(`${uid}:notices`, data.notices);
  }
  if (data.myAttendance) {
    setCached(`${uid}:att:me`, data.myAttendance);
  }
  if (Array.isArray(data.leaves)) {
    if (user.role === 'employee') {
      setCached(`${uid}:leaves:me`, data.leaves);
    } else {
      setCached(`${uid}:leaves:all`, data.leaves);
    }
  }
  if (data.analytics && user.role === 'hr') {
    setCached(`${uid}:analytics:today:${getTodayDateKey()}`, data.analytics);
  }
}

/**
 * Quietly warms all role-relevant tab caches once when entering the dashboard shell
 * so switching tabs is instantaneous for HR, Admin, and Employee alike.
 */
export function preloadWorkspace(user: User): void {
  if (!user?.id || preloadedUsers.has(user.id)) return;
  preloadedUsers.add(user.id);

  const uid = user.id;
  const today = getTodayDateKey();
  const tasks: Promise<unknown>[] = [];

  // Warm Overview + fan-out notices, leaves, and personal attendance
  const overviewKey = `${uid}:overview:today:${today}`;
  if (!getCached(overviewKey)) {
    tasks.push(
      api
        .get('/dashboard/overview', { params: { period: 'today', date: today } })
        .then((res) => {
          setCached(overviewKey, res.data);
          seedCachesFromOverview(user, res.data);
        })
        .catch(() => {}),
    );
  }

  // Warm extra tabs for HR & Admin in parallel
  if (user.role === 'hr' || user.role === 'admin') {
    if (!getCached(`${uid}:att:team::all`)) {
      tasks.push(
        api
          .get('/attendance')
          .then((res) => setCached(`${uid}:att:team::all`, res.data || []))
          .catch(() => {}),
      );
    }
    if (!getCached(`${uid}:team`)) {
      tasks.push(
        api
          .get('/users')
          .then((res) => setCached(`${uid}:team`, res.data || []))
          .catch(() => {}),
      );
    }
    if (!getCached(`${uid}:applicants`)) {
      tasks.push(
        api
          .get('/users/applicants')
          .then((res) => setCached(`${uid}:applicants`, res.data))
          .catch(() => {}),
      );
    }
  }

  if (user.role === 'hr' && !getCached(`${uid}:notification-mail`)) {
    tasks.push(
      api
        .get('/notification-mail')
        .then((res) => setCached(`${uid}:notification-mail`, res.data))
        .catch(() => {}),
    );
  }

  if (user.role === 'admin' && !getCached(`${uid}:leaves:me`)) {
    tasks.push(
      api
        .get('/leave/me')
        .then((res) => setCached(`${uid}:leaves:me`, res.data || []))
        .catch(() => {}),
    );
  }

  void Promise.allSettled(tasks);
}
