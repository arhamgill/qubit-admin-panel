/**
 * Shared by the proxy (edge/server) and the client. Keep this file free of browser APIs.
 *
 * NOTE: this is a mock session for a frontend-only demo. The cookie is set by client
 * code, so it is not a security boundary: a real deployment would issue an HttpOnly,
 * signed session cookie from an authentication server and verify it in the proxy.
 */

export const SESSION_COOKIE = "qubit_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/** Session ids are UUIDs; anything else is treated as signed out. */
export const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const DEMO_EMAIL = "alex.morgan@example.com";

/**
 * Only allow same-site relative paths as a post-login redirect target,
 * preventing open redirects such as `?next=https://evil.example` or `?next=//evil.example`.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/login")) return "/";
  return next;
}
