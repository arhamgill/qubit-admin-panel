import type { ZodType } from "zod";

/**
 * Safe wrapper around localStorage.
 * - Every access is wrapped in try/catch (private mode, blocked storage, SSR).
 * - Falls back to an in-memory map when storage is unavailable, so the app still works.
 * - Reads are validated against a schema, so tampered or stale data is ignored.
 */

export const STORAGE_PREFIX = "admin-dashboard:";

const memory = new Map<string, string>();
const listeners = new Set<() => void>();
let cachedStore: Storage | null | undefined;

function getStore(): Storage | null {
  if (cachedStore !== undefined) return cachedStore;
  try {
    const store = window.localStorage;
    const probe = `${STORAGE_PREFIX}__probe__`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    cachedStore = store;
  } catch {
    cachedStore = null;
  }
  return cachedStore;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function storageGet(key: string): string | null {
  const store = getStore();
  if (!store) return memory.get(key) ?? null;
  try {
    return store.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

/** Returns false when the value could not be saved (e.g. quota exceeded). */
export function storageSet(key: string, value: string): boolean {
  const store = getStore();
  if (!store) {
    memory.set(key, value);
    notify();
    return true;
  }
  try {
    store.setItem(STORAGE_PREFIX + key, value);
  } catch {
    return false;
  }
  notify();
  return true;
}

export function storageRemove(key: string) {
  const store = getStore();
  if (store) {
    try {
      store.removeItem(STORAGE_PREFIX + key);
    } catch {
      /* ignore */
    }
  }
  memory.delete(key);
  notify();
}

export function readJson<T>(key: string, schema: ZodType<T>): T | null {
  const raw = storageGet(key);
  if (raw === null) return null;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  return storageSet(key, JSON.stringify(value));
}

/** Subscribe to changes made in this tab or in other tabs. */
export function subscribeStorage(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(STORAGE_PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
