"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import type { SortDirection, SortField, User } from "@/types";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  sort: SortField;
  dir: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function SortHeader({
  field,
  label,
  sort,
  dir,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  sort: SortField;
  dir: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const active = sort === field;
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3 font-medium", className)}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden />
        <span className="sr-only">, sort {active && dir === "asc" ? "descending" : "ascending"}</span>
      </button>
    </th>
  );
}

function RowActions({ user, onEdit, onDelete }: { user: User; onEdit: (u: User) => void; onDelete: (u: User) => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(user)}
        aria-label={`Edit ${user.name}`}
        title="Edit"
        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onDelete(user)}
        aria-label={`Delete ${user.name}`}
        title="Delete"
        className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function UsersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line border-t border-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-16 md:block" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function UsersTable({ users, loading, sort, dir, onSort, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className={cn("transition-opacity", loading && "pointer-events-none opacity-60")} aria-busy={loading}>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Users</caption>
          <thead className="border-y border-line bg-surface-2/60 text-left text-xs text-muted">
            <tr>
              <SortHeader field="name" label="User" sort={sort} dir={dir} onSort={onSort} />
              <SortHeader field="role" label="Role" sort={sort} dir={dir} onSort={onSort} />
              <SortHeader field="status" label="Status" sort={sort} dir={dir} onSort={onSort} />
              <th scope="col" className="hidden px-4 py-3 font-medium uppercase lg:table-cell">
                Location
              </th>
              <SortHeader field="joinedAt" label="Joined" sort={sort} dir={dir} onSort={onSort} />
              <th scope="col" className="hidden px-4 py-3 font-medium uppercase xl:table-cell">
                Last active
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium uppercase">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} seed={user.id} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{user.location || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(user.joinedAt)}</td>
                <td className="hidden px-4 py-3 whitespace-nowrap text-muted xl:table-cell">
                  {user.status === "pending" ? "Never" : formatRelative(user.lastActiveAt)}
                </td>
                <td className="px-4 py-2">
                  <RowActions user={user} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-line border-t border-line md:hidden">
        {users.map((user) => (
          <li key={user.id} className="flex items-start gap-3 px-4 py-4">
            <Avatar name={user.name} seed={user.id} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
                <span className="text-xs text-muted">Joined {formatDate(user.joinedAt)}</span>
              </div>
            </div>
            <RowActions user={user} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  );
}
