"use client";

import { Menu, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/components/providers/profile-provider";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/feedback";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/types";

const NEXT_THEME: Record<ThemePreference, ThemePreference> = { system: "light", light: "dark", dark: "system" };
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const THEME_LABEL = { light: "Light", dark: "Dark", system: "System" } as const;

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const Icon = THEME_ICON[theme];
  const next = NEXT_THEME[theme];
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${THEME_LABEL[theme]}. Switch to ${THEME_LABEL[next]}.`}
      title={`Theme: ${THEME_LABEL[theme]}`}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { profile, isLoading } = useProfile();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="-ml-2 rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <span className="text-sm font-semibold text-foreground lg:hidden">Qubit Admin</span>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-line" aria-hidden />
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-ring sm:pr-3"
          aria-label={profile ? `Your profile: ${profile.name}` : "Your profile"}
        >
          {isLoading || !profile ? (
            <Skeleton className="size-8 rounded-full" />
          ) : (
            <>
              <Avatar name={profile.name} seed="profile" />
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-40 truncate text-sm font-medium text-foreground">{profile.name}</span>
                <span className="block max-w-40 truncate text-xs text-muted">{profile.jobTitle || "Admin"}</span>
              </span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
