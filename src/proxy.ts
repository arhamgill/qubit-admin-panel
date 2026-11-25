import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath, SESSION_COOKIE, SESSION_PATTERN } from "@/lib/auth-constants";

/**
 * 1. Route guard: signed-out visitors are redirected to /login (and signed-in ones away from it)
 *    before any page renders, so protected content never flashes.
 * 2. Generates a per-request nonce and a strict Content-Security-Policy. Next.js reads the CSP
 *    from the request headers and applies the nonce to its own framework scripts automatically.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = SESSION_PATTERN.test(request.cookies.get(SESSION_COOKIE)?.value ?? "");
  const isLoginPage = pathname === "/login";

  if (!signedIn && !isLoginPage) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", safeNextPath(pathname + search));
    return NextResponse.redirect(url);
  }
  if (signedIn && isLoginPage) {
    return NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url));
  }

  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline styles are required by the charting library (SVG style attributes).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|theme-init.js).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
