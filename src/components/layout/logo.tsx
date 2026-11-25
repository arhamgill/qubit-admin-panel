import { cn } from "@/lib/utils";

/** Qubit mark: a ring with a small signal-orange square leaving it. Matches the landing page. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-6 shrink-0", className)} aria-hidden>
      <circle cx="14" cy="14" r="9.5" fill="none" stroke="currentColor" strokeWidth="3.4" />
      <rect x="20.5" y="20.5" width="8" height="8" rx="1.8" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ withTag = true }: { withTag?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-xl leading-none font-semibold tracking-[-0.045em] text-foreground">qubit</span>
      {withTag && (
        <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-2 uppercase ring-1 ring-line ring-inset">
          Admin
        </span>
      )}
    </span>
  );
}
