type CacheEntry = {
  data: unknown;
  expiry: number;
};

const cache = new Map<string, CacheEntry>();

export const getCache = <T = unknown>(key: string): T | null => {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
};

export const setCache = (key: string, data: unknown, ttlSeconds: number): void => {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiry });
};

export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
};

export const deleteCache = (key: string): void => {
  cache.delete(key);
};
