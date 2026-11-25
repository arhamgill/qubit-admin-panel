import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { formatNumber } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: "admin", label: "Admins", description: "Full access" },
  { role: "editor", label: "Editors", description: "Can manage content" },
  { role: "viewer", label: "Viewers", description: "Read-only access" },
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
      <div className="flex flex-1 flex-col gap-5 p-5">
        {loading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ))
        ) : (
          <ul className="space-y-5">
            {ROLES.map(({ role, label, description }) => {
              const count = breakdown[role];
              const share = total ? Math.round((count / total) * 100) : 0;
              return (
                <li key={role}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                    <span>
                      <span className="font-medium text-foreground">{label}</span>{" "}
                      <span className="text-muted">· {description}</span>
                    </span>
                    <span className="text-foreground tabular-nums">
                      {formatNumber(count)} <span className="text-muted">({share}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-2" aria-hidden>
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${Math.max((count / max) * 100, count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-auto rounded-xl bg-surface-2 p-4">
          <p className="text-sm text-muted">Active right now</p>
          {loading ? (
            <Skeleton className="mt-2 h-6 w-24" />
          ) : (
            <p className="mt-1 text-sm text-foreground">
              <span className="text-xl font-semibold tabular-nums">{activeShare}%</span> of all users have an active
              account
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
