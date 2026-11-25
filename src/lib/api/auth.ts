import { z } from "zod";
import { DEMO_EMAIL, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-constants";
import { generateId } from "@/lib/utils";
import { toFieldErrors } from "@/lib/validation";
import { DEMO_PASSWORD } from "./account";
import { ApiError, simulateLatency } from "./client";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address")
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password").max(128, "Password is too long"),
});

export type LoginInput = z.input<typeof loginSchema>;

function writeSessionCookie(value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/** Mock sign-in against the single demo account. */
export async function signIn(input: unknown): Promise<void> {
  await simulateLatency(500, 900);
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Please fix the highlighted fields.", 422, toFieldErrors(parsed.error));
  }
  // One generic message for both cases, so the form never reveals which emails exist.
  if (parsed.data.email !== DEMO_EMAIL || parsed.data.password !== DEMO_PASSWORD) {
    throw new ApiError("Incorrect email or password.", 401);
  }
  writeSessionCookie(generateId(), SESSION_MAX_AGE_SECONDS);
}

export async function signOut(): Promise<void> {
  await simulateLatency(150, 300);
  writeSessionCookie("", 0);
}
