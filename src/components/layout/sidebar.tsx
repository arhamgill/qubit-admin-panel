"use client";

import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LogoMark, Wordmark } from "./logo";
import { isActivePath, NAV_SECTIONS } from "./nav-items";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md text-foreground" aria-label="Qubit Admin home">
      <LogoMark />
      <span className="collapsed:hidden">
        <Wordmark />
      </span>
    </Link>
  );
}

/*
 * Collapsed styling uses the `collapsed:` variant (see globals.css), which only applies inside
 * the desktop sidebar. The `collapsed` prop is used for non-visual attributes only.
 */
function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex-1 space-y-7 overflow-y-auto px-3 py-5">
      {NAV_SECTIONS.map((section, sectionIndex) => (
        <div key={section.title}>
          <div className="mx-auto mb-3 hidden h-px w-6 bg-line-strong collapsed:block" aria-hidden />
          <p className="eyebrow mb-2.5 flex items-center gap-2 px-3 collapsed:hidden">
            <span className="text-accent-text">{String(sectionIndex + 1).padStart(2, "0")}</span>
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-out",
                      "collapsed:justify-center collapsed:px-0",
                      active
                        ? "bg-surface text-foreground shadow-sm ring-1 ring-line"
                        : "text-ink-2 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="collapsed:sr-only">{item.label}</span>
                    {/* Active indicator: the landing page's 4px orange square. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1/2 right-3 size-1 -translate-y-1/2 rounded-[1px] bg-accent transition-transform duration-300 ease-out",
                        "collapsed:top-auto collapsed:right-auto collapsed:bottom-1 collapsed:left-1/2 collapsed:-translate-x-1/2 collapsed:translate-y-0",
                        active ? "scale-100" : "scale-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function DemoNotice() {
  return (
    <div className="mx-3 mb-3 rounded-xl bg-surface p-3 ring-1 ring-line collapsed:hidden">
      <p className="eyebrow flex items-center gap-2 text-ink-2">
        <span className="size-1.5 animate-[pulse-dot_2s_ease-in-out_infinite] rounded-full bg-success-dot" aria-hidden />
        Demo workspace
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">Data is stored in this browser. Reset it from Settings.</p>
    </div>
  );
}

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  return (
    <aside
      data-desktop-sidebar
      className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-background transition-[width] duration-300 ease-out collapsed:w-[72px] lg:flex"
    >
      <div className="flex h-16 items-center px-6 collapsed:justify-center collapsed:px-0">
        <Brand />
      </div>
      <NavLinks collapsed={collapsed} />
      <DemoNotice />
      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground collapsed:justify-center collapsed:px-0"
        >
          <PanelLeftOpen className="hidden size-[18px] collapsed:block" strokeWidth={1.75} aria-hidden />
          <PanelLeftClose className="size-[18px] collapsed:hidden" strokeWidth={1.75} aria-hidden />
          <span className="collapsed:hidden">Collapse</span>
        </button>
      </div>
    </aside>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in navigation drawer for small screens, built on <dialog> for focus trapping and Escape. */
export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close the drawer if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => media.matches && onClose();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-label="Navigation"
      onClose={() => open && onClose()}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-background p-0 text-foreground shadow-lg ring-1 ring-line open:animate-[drawer-in_280ms_var(--ease-out)] lg:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="-mr-2 rounded-lg p-2 text-muted hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
        <DemoNotice />
      </div>
    </dialog>
  );
}
