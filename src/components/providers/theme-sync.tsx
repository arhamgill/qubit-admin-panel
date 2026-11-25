"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

/** Applies the theme preference to <html> and follows OS changes when set to "system". */
export function ThemeSync() {
  const [theme] = useTheme();

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return null;
}
