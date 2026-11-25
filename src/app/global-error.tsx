"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last-resort boundary for errors thrown in the root layout or providers.
 * It replaces the root layout, so it renders its own <html> and <body>.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this is where an error-reporting service would be called.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
          <p className="eyebrow inline-flex items-center gap-2.5 text-ink-2">
            <span className="text-accent-text">500</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden />
            Unexpected error
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground">Something went wrong</h1>
          <p className="mt-3 max-w-sm text-[15px] text-ink-2">
            The app hit an error it couldn&apos;t recover from. Try again, or reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-btn transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-btn-hover"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
