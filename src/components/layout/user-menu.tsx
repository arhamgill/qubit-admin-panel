"use client";

import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useProfile } from "@/components/providers/profile-provider";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/feedback";
import { signOut } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-2 transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground";

/** Account disclosure menu in the header: profile, settings and sign out. */
export function UserMenu() {
  const { profile, isLoading } = useProfile();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on outside click or Escape (returning focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // replace() so Back doesn't return to the dashboard; refresh() drops the client router cache.
    router.replace("/login");
    router.refresh();
  }

  if (isLoading || !profile) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${profile.name}`}
        className={cn(
          "flex items-center gap-2.5 rounded-lg p-1 transition-colors duration-200 hover:bg-foreground/5 sm:pr-2",
          open && "bg-foreground/5",
        )}
      >
        <Avatar name={profile.name} seed="profile" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-40 truncate text-[13px] leading-tight font-medium text-foreground">
            {profile.name}
          </span>
          <span className="block max-w-40 truncate text-xs leading-tight text-muted">
            {profile.jobTitle || "Admin"}
          </span>
        </span>
        <ChevronDown
          className={cn("hidden size-3.5 text-muted transition-transform duration-200 sm:block", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-40 mt-2 w-64 origin-top-right animate-[dialog-in_180ms_var(--ease-out)] rounded-xl bg-surface p-1.5 shadow-lg ring-1 ring-line"
        >
          <div className="px-2.5 pt-2 pb-2.5">
            <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
            <p className="truncate text-[13px] text-muted">{profile.email}</p>
          </div>
          <div className="my-1 h-px bg-line" aria-hidden />
          <ul>
            <li>
              <Link href="/profile" className={itemClass} onClick={() => setOpen(false)}>
                <UserCircle className="size-4" strokeWidth={1.75} aria-hidden />
                Profile
              </Link>
            </li>
            <li>
              <Link href="/settings" className={itemClass} onClick={() => setOpen(false)}>
                <Settings className="size-4" strokeWidth={1.75} aria-hidden />
                Settings
              </Link>
            </li>
          </ul>
          <div className="my-1 h-px bg-line" aria-hidden />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(itemClass, "hover:bg-danger-soft hover:text-danger disabled:opacity-60")}
          >
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
