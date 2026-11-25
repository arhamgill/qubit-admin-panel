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
            className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />
      <ul className="mt-3 divide-y divide-line">
        {!users
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </li>
            ))
          : users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={user.name} seed={user.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-sm text-muted">{user.email}</p>
                </div>
                <div className="hidden sm:block">
                  <RoleBadge role={user.role} />
                </div>
                <StatusBadge status={user.status} />
                <span className="hidden w-24 text-right text-sm text-muted md:block">
                  {formatRelative(user.joinedAt)}
                </span>
              </li>
            ))}
      </ul>
      {users?.length === 0 && <p className="px-5 pb-5 text-sm text-muted">No users yet.</p>}
    </Card>
  );
}
