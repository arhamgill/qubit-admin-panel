import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types";

const STATUS_STYLES: Record<UserStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "bg-success-soft text-success", dot: "bg-success-dot" },
  pending: { label: "Pending", className: "bg-warning-soft text-warning", dot: "bg-warning-dot" },
  inactive: { label: "Inactive", className: "bg-surface-2 text-muted", dot: "bg-muted" },
};

/** Status is always conveyed by text + dot, never colour alone. */
export function StatusBadge({ status }: { status: UserStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        style.className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </span>
  );
}

const ROLE_LABELS: Record<UserRole, string> = { admin: "Admin", editor: "Editor", viewer: "Viewer" };

/** Mono uppercase tag, like the landing page's "NEW" / "−20%" tags. */
export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.05em] uppercase",
        role === "admin"
          ? "bg-accent-soft text-accent-text"
          : "bg-surface text-ink-2 ring-1 ring-line-strong ring-inset",
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

/** Generic small mono tag. */
export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.05em] uppercase",
        tone === "accent" ? "bg-accent-soft text-accent-text" : "bg-surface-2 text-ink-2",
      )}
    >
      {children}
    </span>
  );
}
