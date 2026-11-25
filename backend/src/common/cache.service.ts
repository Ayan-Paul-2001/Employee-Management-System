import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry<any>>();
  private readonly inflight = new Map<string, Promise<any>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = 30_000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Deduplicates concurrent cache misses and caches the resolved value.
   */
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    ttlMs = 30_000,
  ): Promise<T> {
    const hit = this.get<T>(key);
    if (hit !== undefined) return hit;

    const existingPromise = this.inflight.get(key);
    if (existingPromise) return existingPromise as Promise<T>;

    const promise = loader()
      .then((val) => {
        this.set(key, val, ttlMs);
        this.inflight.delete(key);
        return val;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  invalidateExact(key: string): void {
    this.store.delete(key);
  }
}
