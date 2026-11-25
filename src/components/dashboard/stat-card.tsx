import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

/**
 * "Spec-sheet" grid: stat cells share hairline borders inside one surface,
 * instead of floating as separate cards.
 */
export function StatGrid({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      className="grid grid-cols-2 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line xl:grid-cols-4"
    >
      {children}
    </section>
  );
}

interface StatCardProps {
  label: string;
  icon: React.ReactNode;
  value?: string;
  /** Signed percentage change; null/undefined hides the delta. */
  delta?: number | null;
  /** What the delta is compared against, e.g. "vs previous 30 days". */
  deltaLabel?: string;
  /** Secondary line when there is no delta. */
  hint?: string;
  loading?: boolean;
}

export function StatCard({ label, icon, value, delta, deltaLabel, hint, loading }: StatCardProps) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = hasDelta && delta >= 0;

  return (
    <div
      className={cn(
        "group relative min-w-0 p-4 sm:p-6",
        // Shared hairlines (right + bottom); the container clips the outer edges.
        "shadow-[1px_0_0_0_var(--line),0_1px_0_0_var(--line)]",
        // Orange top rule that draws in on hover, from the landing page's feature grid.
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-accent",
        "before:transition-transform before:duration-500 before:ease-out hover:before:scale-x-100",
      )}
    >
      <div className="flex items-center gap-2 text-muted">
        <span className="[&>svg]:size-[15px]" aria-hidden>
          {icon}
        </span>
        <p className="eyebrow">{label}</p>
      </div>

      {loading || value === undefined ? (
        <div className="mt-5 space-y-2.5">
          <Skeleton className="h-9 w-32 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
      ) : (
        <>
          <p className="mt-4 text-[1.625rem] leading-none sm:text-[2.25rem] font-semibold tracking-[-0.045em] text-foreground tabular-nums">
            {value}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            {hasDelta && (
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-0.5 rounded px-1.5 font-mono text-[11px] font-semibold tabular-nums",
                  positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3" strokeWidth={2.5} aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3" strokeWidth={2.5} aria-hidden />
                )}
                <span className="sr-only">{positive ? "Up" : "Down"} </span>
                {positive ? "+" : "−"}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            {(deltaLabel || hint) && <span className="text-muted">{hasDelta ? deltaLabel : hint}</span>}
          </div>
        </>
      )}
    </div>
  );
}
