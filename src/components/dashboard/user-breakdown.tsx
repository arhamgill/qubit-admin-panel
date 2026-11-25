import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { formatNumber } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: "admin", label: "Admins", description: "Full access" },
  { role: "editor", label: "Editors", description: "Manage content" },
  { role: "viewer", label: "Viewers", description: "Read-only" },
];

interface UserBreakdownProps {
  breakdown?: Record<UserRole, number>;
  total?: number;
  activeUsers?: number;
}

export function UserBreakdown({ breakdown, total, activeUsers }: UserBreakdownProps) {
  const loading = !breakdown || total === undefined;
  const max = breakdown ? Math.max(1, ...Object.values(breakdown)) : 1;
  const activeShare = total && activeUsers !== undefined ? Math.round((activeUsers / total) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader title="Users by role" description="How access is distributed" />
      <div className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-5">
            {ROLES.map(({ role, label, description }) => {
              const count = breakdown[role];
              const share = total ? Math.round((count / total) * 100) : 0;
              return (
                <li key={role}>
                  <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                    <span>
                      <span className="font-medium text-foreground">{label}</span>{" "}
                      <span className="text-muted">· {description}</span>
                    </span>
                    <span className="font-mono text-[12.5px] text-foreground tabular-nums">
                      {formatNumber(count)} <span className="text-muted">/ {share}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2" aria-hidden>
                    <div
                      className="h-full rounded-full bg-bar"
                      style={{ width: `${Math.max((count / max) * 100, count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Dark panel as the contrast element, like the landing page's product surfaces. */}
        <div className="mt-auto rounded-xl bg-panel p-5 text-panel-foreground">
          <p className="font-mono text-[10.5px] font-medium tracking-[0.06em] text-panel-muted uppercase">
            Active accounts
          </p>
          {loading ? (
            <div className="mt-3 h-10 w-24 animate-pulse rounded-md bg-panel-2" aria-hidden />
          ) : (
            <div className="mt-2 flex items-end gap-3">
              <p className="text-[2.75rem] leading-[0.9] font-semibold tracking-[-0.06em] text-accent tabular-nums">
                {activeShare}%
              </p>
              <p className="pb-0.5 text-[13px] leading-snug text-panel-muted">
                of all users can sign in and are using the workspace
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
