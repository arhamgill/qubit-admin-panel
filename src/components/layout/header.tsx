"use client";

import { Menu, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/types";
import { LogoMark } from "./logo";
import { isActivePath, NAV_SECTIONS } from "./nav-items";
import { UserMenu } from "./user-menu";

const NEXT_THEME: Record<ThemePreference, ThemePreference> = { system: "light", light: "dark", dark: "system" };
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const THEME_LABEL = { light: "Light", dark: "Dark", system: "System" } as const;

const iconButton =
  "rounded-lg p-2 text-ink-2 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground";

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
      className={iconButton}
    >
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function Breadcrumb() {
  const pathname = usePathname();
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => isActivePath(pathname, i.href));
    if (item) {
      return (
        <p className="eyebrow hidden items-center gap-2 lg:flex">
          <span>{section.title}</span>
          <span className="text-line-strong" aria-hidden>
            /
          </span>
          <span className="text-foreground">{item.label}</span>
        </p>
      );
    }
  }
  return null;
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-background/80 px-4 backdrop-blur-md backdrop-saturate-150 sm:px-6 lg:px-8">
      <button type="button" onClick={onOpenMenu} aria-label="Open navigation" className={`-ml-2 lg:hidden ${iconButton}`}>
        <Menu className="size-5" strokeWidth={1.75} aria-hidden />
      </button>
      <Link href="/" className="flex items-center gap-2 text-foreground lg:hidden" aria-label="Qubit Admin home">
        <LogoMark className="size-5" />
        <span className="text-lg leading-none font-semibold tracking-[-0.045em]">qubit</span>
      </Link>
      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <div className="mx-1.5 h-5 w-px bg-line-strong" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
}
