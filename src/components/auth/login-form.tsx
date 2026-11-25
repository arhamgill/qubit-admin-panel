"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-controls";
import { DEMO_PASSWORD } from "@/lib/api/account";
import { loginSchema, signIn, type LoginInput } from "@/lib/api/auth";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { DEMO_EMAIL, safeNextPath } from "@/lib/auth-constants";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof LoginInput, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (formError) setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      await signIn(parsed.data);
      // The proxy sees the new session cookie on the next request; refresh() drops any cached redirects.
      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors as FieldErrors<LoginInput>);
      else setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-2xl bg-surface p-6 shadow-md ring-1 ring-line sm:p-7"
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
          autoFocus
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
        <Button type="submit" loading={submitting} className="group w-full">
          Sign in
          {!submitting && (
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
              aria-hidden
            />
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 px-4 py-3.5 ring-1 ring-line ring-inset">
        <div className="min-w-0">
          <p className="eyebrow text-ink-2">Demo account</p>
          <p className="mt-1 truncate font-mono text-[12.5px] text-foreground">
            {DEMO_EMAIL} <span className="text-muted">/</span> {DEMO_PASSWORD}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setValues({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
            setErrors({});
            setFormError(null);
          }}
        >
          Fill in
        </Button>
      </div>
    </div>
  );
}
