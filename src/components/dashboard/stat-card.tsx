import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

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
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="rounded-lg bg-primary-soft p-2 text-primary" aria-hidden>
          {icon}
        </span>
      </div>

      {loading || value === undefined ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {hasDelta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                  positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3.5" aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3.5" aria-hidden />
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
    </Card>
  );
}
