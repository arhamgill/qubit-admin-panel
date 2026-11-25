import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from "@/lib/mock/seed";
import { readJson, storageRemove, writeJson } from "@/lib/storage";
import { passwordChangeSchema, profileSchema, settingsSchema, toFieldErrors } from "@/lib/validation";
import type { Profile, Settings } from "@/types";
import { ApiError, simulateLatency } from "./client";

/** The demo account's password, used by the mock sign-in and the change-password check. */
export const DEMO_PASSWORD = "Demo1234";

const PROFILE_KEY = "v1:profile";
const SETTINGS_KEY = "v1:settings";

function persist(key: string, value: unknown) {
  if (!writeJson(key, value)) {
    throw new ApiError("Couldn't save changes: browser storage is full or unavailable.", 507);
  }
}

export async function getProfile(): Promise<Profile> {
  await simulateLatency(150, 350);
  return readJson(PROFILE_KEY, profileSchema) ?? DEFAULT_PROFILE;
}

export async function updateProfile(input: unknown): Promise<Profile> {
  await simulateLatency();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Please fix the highlighted fields.", 422, toFieldErrors(parsed.error));
  }
  persist(PROFILE_KEY, parsed.data);
  return parsed.data;
}

export async function getSettings(): Promise<Settings> {
  await simulateLatency(150, 350);
  return readJson(SETTINGS_KEY, settingsSchema) ?? DEFAULT_SETTINGS;
}

export async function updateSettings(input: unknown): Promise<Settings> {
  await simulateLatency();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) throw new ApiError("Some settings are invalid.", 422);
  persist(SETTINGS_KEY, parsed.data);
  return parsed.data;
}

/**
 * Mock password change. The input is validated exactly as a real endpoint would and the
 * current password is checked against the demo password, but the new password is never
 * stored anywhere, not even in localStorage.
 */
export async function changePassword(input: unknown): Promise<void> {
  await simulateLatency(400, 800);
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Please fix the highlighted fields.", 422, toFieldErrors(parsed.error));
  }
  if (parsed.data.currentPassword !== DEMO_PASSWORD) {
    throw new ApiError("Please fix the highlighted fields.", 422, {
      currentPassword: "Current password is incorrect",
    });
  }
}

/** Clears all demo data; users, profile, settings and UI preferences fall back to their defaults. */
export async function resetDemoData(): Promise<void> {
  await simulateLatency();
  storageRemove("v1:users");
  storageRemove(PROFILE_KEY);
  storageRemove(SETTINGS_KEY);
  // UI preferences too, so "restore defaults" means everything.
  storageRemove("theme");
  storageRemove("sidebar");
}
