"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileProvider } from "@/components/providers/profile-provider";
import { usePreference } from "@/hooks/use-preference";
import { storageGet } from "@/lib/storage";
import { Header } from "./header";
import { DesktopSidebar, MobileSidebar } from "./sidebar";

const SIDEBAR_STATES = ["expanded", "collapsed"] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebar, setSidebar] = usePreference("sidebar", SIDEBAR_STATES, "expanded");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Mirror the preference onto <html data-sidebar>, which drives the collapsed styles.
  // Reads storage directly (not the hydration snapshot) so the first commit never flips it.
  useEffect(() => {
    document.documentElement.dataset.sidebar = storageGet("sidebar") === "collapsed" ? "collapsed" : "expanded";
  }, [sidebar]);

  return (
    <ProfileProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
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
          <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-8 pb-12 sm:px-6 lg:px-10 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
