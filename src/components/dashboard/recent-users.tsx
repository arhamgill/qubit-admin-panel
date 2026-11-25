import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { formatRelative } from "@/lib/utils";
import type { User } from "@/types";

export function RecentUsers({ users }: { users?: User[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent sign-ups"
        description="The newest members of your workspace"
        action={
          <Link
            href="/users?sort=joinedAt&dir=desc"
            className="group inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-2 transition-colors duration-200 hover:text-accent-text"
          >
            View all{" "}
            <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" aria-hidden />
          </Link>
        }
      />
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {!users
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </li>
            ))
          : users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-background/60 sm:px-6">
                <Avatar name={user.name} seed={user.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-[13px] text-muted">{user.email}</p>
                </div>
                <div className="hidden sm:block">
                  <RoleBadge role={user.role} />
                </div>
                <StatusBadge status={user.status} />
                <span className="hidden w-24 text-right font-mono text-xs text-muted md:block">
                  {formatRelative(user.joinedAt)}
                </span>
              </li>
            ))}
      </ul>
      {users?.length === 0 && <p className="px-5 pb-5 text-sm text-muted">No users yet.</p>}
    </Card>
  );
}
