"use client";

import { useCallback, useSyncExternalStore } from "react";
import { storageGet, storageSet, subscribeStorage } from "@/lib/storage";

/**
 * A string preference persisted in localStorage, restricted to an allow-list.
 * Uses useSyncExternalStore so it's hydration-safe (server renders `fallback`)
 * and stays in sync across components and browser tabs.
 */
export function usePreference<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): [T, (value: T) => void] {
  const getSnapshot = () => {
    const raw = storageGet(key);
    return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
  };

  const value = useSyncExternalStore(subscribeStorage, getSnapshot, () => fallback);

  const setValue = useCallback(
    (next: T) => {
      if ((allowed as readonly string[]).includes(next)) storageSet(key, next);
    },
    [allowed, key],
  );

  return [value, setValue];
}
