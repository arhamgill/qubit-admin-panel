import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types";

const STATUS_STYLES: Record<UserStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "bg-success-soft text-success", dot: "bg-success" },
  pending: { label: "Pending", className: "bg-warning-soft text-warning", dot: "bg-warning" },
  inactive: { label: "Inactive", className: "bg-surface-2 text-muted", dot: "bg-muted" },
};

/** Status is always conveyed by text + dot, never colour alone. */
export function StatusBadge({ status }: { status: UserStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </span>
  );
}

const ROLE_LABELS: Record<UserRole, string> = { admin: "Admin", editor: "Editor", viewer: "Viewer" };

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        role === "admin" ? "border-primary/30 bg-primary-soft text-primary" : "border-line text-foreground",
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
