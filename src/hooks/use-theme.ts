"use client";

import type { ThemePreference } from "@/types";
import { usePreference } from "./use-preference";

export const THEME_OPTIONS = ["light", "dark", "system"] as const satisfies readonly ThemePreference[];

/** Key must match the one read by public/theme-init.js. */
export function useTheme() {
  return usePreference<ThemePreference>("theme", THEME_OPTIONS, "system");
}
