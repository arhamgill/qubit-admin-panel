import { z } from "zod";
import { SORT_FIELDS, USER_ROLES, USER_STATUSES } from "@/types";

/** Letters (any language), spaces, apostrophes, hyphens and dots. */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be 60 characters or fewer")
  .regex(NAME_PATTERN, "Name can only contain letters, spaces, apostrophes, hyphens and dots");

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

export const userInputSchema = z.object({
  name: nameField,
  email: emailField,
  role: z.enum(USER_ROLES, "Select a role"),
  status: z.enum(USER_STATUSES, "Select a status"),
  location: optionalText(80, "Location"),
});

/** Full stored record; used to validate anything read back from localStorage. */
export const userSchema = userInputSchema.extend({
  id: z.string().min(1).max(64),
  joinedAt: z.iso.datetime(),
  lastActiveAt: z.iso.datetime(),
});

export const profileSchema = z.object({
  name: nameField,
  email: emailField,
  jobTitle: optionalText(60, "Job title"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine((v) => v === "" || /^\+?[0-9 ()-]{7,20}$/.test(v), "Enter a valid phone number"),
  location: optionalText(80, "Location"),
  bio: optionalText(280, "Bio"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must differ from the current one",
  });

export const TIMEZONES = [
  "UTC",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
] as const;

export const settingsSchema = z.object({
  notifications: z.object({
    productUpdates: z.boolean(),
    weeklyReport: z.boolean(),
    securityAlerts: z.boolean(),
    newUserSignups: z.boolean(),
  }),
  timezone: z.enum(TIMEZONES),
});

/** Parses untrusted URL search params into a safe, fully-defaulted query. */
export const userQuerySchema = z.object({
  search: z.string().trim().max(100).catch(""),
  role: z.enum([...USER_ROLES, "all"]).catch("all"),
  status: z.enum([...USER_STATUSES, "all"]).catch("all"),
  sort: z.enum(SORT_FIELDS).catch("joinedAt"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((n) => [10, 20, 50].includes(n))
    .catch(10),
});

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Maps Zod issues to the first message per top-level field. */
export function toFieldErrors<T>(error: z.ZodError): FieldErrors<T> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }
  return result as FieldErrors<T>;
}
