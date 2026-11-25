"use client";

import { useCallback, useState } from "react";
import { ProfileProvider } from "@/components/providers/profile-provider";
import { usePreference } from "@/hooks/use-preference";
import { Header } from "./header";
import { DesktopSidebar, MobileSidebar } from "./sidebar";

const SIDEBAR_STATES = ["expanded", "collapsed"] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebar, setSidebar] = usePreference("sidebar", SIDEBAR_STATES, "expanded");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <ProfileProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh">
        <DesktopSidebar
          collapsed={sidebar === "collapsed"}
          onToggle={() => setSidebar(sidebar === "collapsed" ? "expanded" : "collapsed")}
        />
        <MobileSidebar open={mobileOpen} onClose={closeMobile} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMenu={() => setMobileOpen(true)} />
          <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
