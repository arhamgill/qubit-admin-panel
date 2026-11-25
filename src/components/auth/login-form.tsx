"use client";

import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-controls";
import { DEMO_PASSWORD } from "@/lib/api/account";
import { loginSchema, signIn, type LoginInput } from "@/lib/api/auth";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { DEMO_EMAIL, safeNextPath } from "@/lib/auth-constants";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

const DEMO_CREDENTIALS: LoginInput = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState<"form" | "demo" | null>(null);

  function update(key: keyof LoginInput, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (formError) setFormError(null);
  }

  async function submit(input: LoginInput, source: "form" | "demo") {
    if (submitting) return;
    setFormError(null);

    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setSubmitting(source);
    try {
      await signIn(parsed.data);
      // The proxy sees the new session cookie on the next request; refresh() drops any cached redirects.
      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors as FieldErrors<LoginInput>);
      else setFormError(getErrorMessage(error));
      setSubmitting(null);
    }
  }

  function signInWithDemo() {
    // Fill the fields visibly too, so it's clear which account is being used.
    setValues(DEMO_CREDENTIALS);
    setErrors({});
    void submit(DEMO_CREDENTIALS, "demo");
  }

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-md ring-1 ring-line sm:p-7">
      {/* Demo account callout: the fastest way in for reviewers. */}
      <section aria-labelledby="demo-title" className="rounded-xl bg-accent-soft p-4 ring-1 ring-accent/25 ring-inset">
        <p id="demo-title" className="eyebrow flex items-center gap-1.5 text-accent-text">
          <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
          Demo account
        </p>
        <p className="mt-1.5 text-sm text-ink-2">Reviewing this project? Skip the typing and jump straight in.</p>
        <p className="mt-2 font-mono text-[12px] break-all text-foreground">
          {DEMO_EMAIL} <span className="text-muted">/</span> {DEMO_PASSWORD}
        </p>
        <Button
          variant="accent"
          onClick={signInWithDemo}
          loading={submitting === "demo"}
          disabled={submitting === "form"}
          className="group mt-3.5 w-full"
        >
          Sign in with demo account
          {submitting !== "demo" && (
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
              aria-hidden
            />
          )}
        </Button>
      </section>

      <div className="my-6 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="eyebrow">or sign in with email</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(values, "form");
        }}
        noValidate
        className="space-y-4"
      >
        {formError && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
            {formError}
          </p>
        )}
        <TextField
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="username"
          maxLength={254}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          placeholder="you@company.com"
        />
        <div className="relative">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            maxLength={128}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-[31px] right-1.5 rounded-md p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye className="size-4" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
        <Button
          type="submit"
          variant="secondary"
          loading={submitting === "form"}
          disabled={submitting === "demo"}
          className="w-full"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
