# Qubit Admin: Admin Dashboard

A responsive admin dashboard built with **Next.js 16 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS v4**.
It uses a mock API layer backed by `localStorage`, so it runs with **no database, no backend and no environment variables**.

> **Demo login:** `alex.morgan@example.com` / `Demo1234` (or click **Fill in** on the sign-in page).

## Features

| Requirement | Implementation |
| --- | --- |
| Sign in / sign out | Mock login page with route protection; account menu in the header with **Sign out** |
| Dashboard overview | `/`: KPIs, revenue analytics, users by role, recent sign-ups |
| Statistics cards | Revenue, total users, active users and new sign-ups, each with its change vs the previous period |
| Revenue analytics chart | Recharts area chart with a 7D / 30D / 12M range switch, hover tooltip and an accessible **table view** |
| User management table | Sortable columns, pagination, page-size selector; switches to a card layout on mobile |
| Search & filters | Debounced search (name / email / location) plus role and status filters, all **synced to the URL** (shareable, back-button friendly) |
| Add / Edit / Delete users | Modal form with field-level validation, duplicate-email check, delete confirmation and toast feedback |
| Profile & settings | `/profile` (personal info + change password) and `/settings` (theme, notifications, timezone, reset demo data) |
| Sidebar navigation | Grouped links with active state, collapsible on desktop (remembered), slide-in drawer on mobile |
| Fully responsive | Tested from 390px phones to 1440px desktops; light, dark and system themes |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (next/core-web-vitals + TypeScript rules)
```

Requires Node.js 20.9+.

## Project structure

```
src/
├── app/                      # Routes (App Router)
│   ├── (dashboard)/          # Route group sharing the sidebar/header shell
│   │   ├── page.tsx          # Dashboard
│   │   ├── users/            # User management
│   │   ├── profile/          # Profile
│   │   ├── settings/         # Settings
│   │   └── error.tsx         # Error boundary for dashboard pages
│   ├── layout.tsx            # Root layout: fonts, theme, toasts, CSP nonce
│   └── not-found.tsx
├── components/
│   ├── ui/                   # Reusable primitives: Button, form fields, Modal, Card, Badge, Pagination…
│   ├── layout/               # AppShell, Sidebar (desktop + mobile drawer), Header
│   ├── dashboard/            # StatCard, RevenueChart, UserBreakdown, RecentUsers
│   ├── users/                # UsersView, UsersTable, UsersToolbar, UserFormDialog
│   ├── account/              # ProfileView, PasswordForm, SettingsView
│   └── providers/            # Toast, Profile and Theme providers
├── hooks/                    # useApiQuery, usePreference, useTheme
├── lib/
│   ├── api/                  # Mock API: users, analytics, account (async, typed errors)
│   ├── mock/seed.ts          # Deterministic seed data + revenue generator
│   ├── storage.ts            # Safe, schema-validated localStorage wrapper
│   ├── validation.ts         # Zod schemas shared by the UI and the mock API
│   └── utils.ts              # Formatting helpers
├── types/                    # Shared domain types
└── proxy.ts                  # Per-request CSP nonce (Next.js 16 "proxy", formerly middleware)
```

## Visual design

The UI shares its design system with the Qubit landing page, so the product and the marketing site feel like one brand:

- **Warm paper and ink neutrals** (`#f5f3ee` / `#141413`) with hairline borders drawn as 1px shadow rings, and soft shadows tinted with ink.
- **One signal-orange accent** (`#ef5a1f`), used sparingly: the logo square, the active-nav indicator, section numbers, the revenue line and focus rings. Primary buttons are ink, not orange.
- **Geist and Geist Mono.** Headings and figures use tight negative tracking. Mono uppercase labels ("01 —— OVERVIEW"), tags, dates and numbers give it a spec-sheet feel.
- **Dark "product panels"** (tooltips, toasts, the active-accounts highlight) act as the contrast element. Dark mode is built from the same panel scale.
- **Quiet motion** using the shared `cubic-bezier(0.22, 1, 0.36, 1)` easing: a short content rise on page load, an orange rule that draws across stat cells on hover, and a pressed state on buttons. All of it respects `prefers-reduced-motion`.

All tokens live as CSS custom properties in `src/app/globals.css` and are exposed to Tailwind through `@theme`.

## Design decisions

**Mock API instead of a database.** Every function in `src/lib/api` is `async`, adds realistic latency and throws a typed `ApiError` (with optional per-field errors), just like a real HTTP client. The UI only talks to this layer, so swapping in real `fetch` calls later doesn't touch any component. Data is persisted in `localStorage`, so changes survive a refresh; **Settings → Reset demo data** restores the seed.

**Deterministic data.** Users are generated by a seeded PRNG, and revenue is derived from the calendar date, so every reset produces the same, realistic-looking dataset.

**URL as state.** The users page keeps search, filters, sort and page in the query string. Links are shareable, and filter, sort and page changes create history entries, so the Back button undoes them. Refining a search replaces the current entry instead, so each keystroke doesn't add one.

**Mock authentication.** Signing in sets a session cookie, and `src/proxy.ts` redirects signed-out visitors to `/login` before any page renders, so protected content never flashes. The post-login `?next=` target only accepts same-site paths, which prevents open redirects. Sign-in errors use one generic message, so the form doesn't reveal which emails exist.

**Data fetching.** `useApiQuery` is a small hook that keeps the previous data visible while refetching (no table flicker), ignores responses from stale requests, and exposes `reload()` after mutations.

**Accessibility.** Native `<dialog>` for modals and the mobile drawer (focus trap, Escape, inert background), labelled form controls with `aria-invalid` / `aria-describedby`, `aria-sort` on sortable headers, `role="switch"` toggles, live regions for results and toasts, a skip link, visible focus rings, reduced-motion support, and status shown with text and colour rather than colour alone.

## Security

Even as a mock-up, the app follows the practices a production admin panel needs:

- **Strict Content-Security-Policy** with a per-request nonce and `strict-dynamic` (`src/proxy.ts`). No `unsafe-inline` or `unsafe-eval` for scripts in production. The theme bootstrap script is an external, nonce'd file instead of inline code.
- **Security headers**: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`. The `X-Powered-By` header is disabled.
- **Route protection and safe redirects.** Pages are guarded in the proxy (server-side), and the login redirect target is restricted to same-site paths.
- **Validation everywhere.** Zod schemas validate every form on the client and again inside the mock API ("never trust the caller"). Names reject markup characters, emails are normalised, and lengths are capped.
- **Untrusted input is sanitised.** URL query params are parsed against an allow-list with safe fallbacks. Data read back from `localStorage` is schema-validated record by record: tampered or corrupted records are dropped and the rest are kept, and the seed is restored only if nothing valid remains.
- **No raw HTML rendering.** There's no `dangerouslySetInnerHTML`; all content goes through React's escaping.
- **Passwords are never stored.** The change-password flow checks the current (demo) password and validates the new one's strength, but never persists it anywhere.
- **Bounded storage.** The user list is capped at 500 records, and write failures (e.g. quota exceeded) surface as errors instead of silently losing data.
- **No secrets.** There are no API keys or `.env` files, and `npm audit` reports 0 vulnerabilities.

> **About the mock auth:** the session cookie is set by client-side code, so it demonstrates the flow but isn't a security boundary. Everything runs in the browser, roles are labels, and `localStorage` can be edited by the user. A real deployment would have an auth server issue an HttpOnly, signed session cookie (verified in `proxy.ts`), and the mock API would be replaced by authenticated endpoints that enforce the same Zod schemas and role-based permissions server-side.
