"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/client";

interface QueryState<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Minimal data-fetching hook for the mock API.
 * - Re-fetches whenever `key` changes; `reload()` forces a re-fetch.
 * - Keeps the previous data while a new request is in flight (no table flicker).
 * - Ignores responses from stale requests (no race conditions).
 */
export function useApiQuery<T>(key: string, fetcher: () => Promise<T>) {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${key}#${reloadToken}`;
  const [state, setState] = useState<QueryState<T> | null>(null);

  useEffect(() => {
    let active = true;
    fetcherRef
      .current()
      .then((data) => {
        if (active) setState({ key: requestKey, data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState((prev) => ({ key: requestKey, data: prev?.data, error: getErrorMessage(error) }));
        }
      });
    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);
  const isSettled = state?.key === requestKey;

  return {
    data: state?.data,
    error: isSettled ? state?.error : undefined,
    isLoading: !isSettled,
    /** True only for the very first load, before any data exists. */
    isInitialLoading: !isSettled && state?.data === undefined,
    reload,
  };
}
