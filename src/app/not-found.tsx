import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow inline-flex items-center gap-2.5 text-ink-2">
        <span className="text-accent-text">404</span>
        <span className="h-px w-6 bg-line-strong" aria-hidden />
        Not found
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-[15px] text-ink-2">It may have been moved, or the link is out of date.</p>
      <Link
        href="/"
        className="mt-7 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-btn transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-btn-hover"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
