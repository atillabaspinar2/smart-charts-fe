type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

const memory = new Map<string, CacheEntry<unknown>>();

function nowMs() {
  return Date.now();
}

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function cacheGet<T>(key: string): T | null {
  const mem = memory.get(key);
  if (mem) {
    if (mem.expiresAtMs > nowMs()) return mem.value as T;
    memory.delete(key);
  }

  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = safeJsonParse<CacheEntry<T>>(raw);
  if (!parsed) return null;
  if (parsed.expiresAtMs <= nowMs()) {
    localStorage.removeItem(key);
    return null;
  }

  memory.set(key, parsed as CacheEntry<unknown>);
  return parsed.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = {
    value,
    expiresAtMs: nowMs() + ttlMs,
  };
  memory.set(key, entry as CacheEntry<unknown>);
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore (storage full / blocked)
  }
}

export function stableKey(parts: Array<string | number | boolean | null | undefined>) {
  return parts.map((p) => String(p ?? "")).join("|");
}

