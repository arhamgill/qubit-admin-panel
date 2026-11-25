/**
 * Shared primitives for the mock API. Every function in `src/lib/api` is async
 * and behaves like a network call (latency, typed errors), so replacing the
 * implementation with real `fetch` calls later doesn't touch any UI code.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Partial<Record<string, string>>;

  constructor(message: string, status = 400, fieldErrors?: Partial<Record<string, string>>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function simulateLatency(min = 250, max = 600): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) return error.message;
  return fallback;
}
