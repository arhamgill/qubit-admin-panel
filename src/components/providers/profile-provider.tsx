"use client";

import { createContext, useContext, useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { getProfile } from "@/lib/api/account";
import type { Profile } from "@/types";

interface ProfileContextValue {
  profile?: Profile;
  isLoading: boolean;
  error?: string;
  reload: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Shares the signed-in user's profile between the header and the profile page. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data, isInitialLoading, error, reload } = useApiQuery("profile", getProfile);

  const value = useMemo(
    () => ({ profile: data, isLoading: isInitialLoading, error, reload }),
    [data, isInitialLoading, error, reload],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside <ProfileProvider>");
  return context;
}
