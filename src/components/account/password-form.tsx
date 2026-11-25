"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { TextField } from "@/components/ui/form-controls";
import { changePassword, DEMO_PASSWORD } from "@/lib/api/account";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { passwordChangeSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState<PasswordValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<PasswordValues>>({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(key: keyof PasswordValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const parsed = passwordChangeSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setSaving(true);
    try {
      await changePassword(parsed.data);
      setValues(EMPTY);
      setShow(false);
      toast({ title: "Password updated", description: "Use your new password next time you sign in." });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors as FieldErrors<PasswordValues>);
      else toast({ title: "Couldn't update password", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const type = show ? "text" : "password";

  return (
    <Card>
      <CardHeader
        title="Change password"
        description="Use at least 8 characters with upper and lowercase letters and a number."
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "Hide passwords" : "Show passwords"}
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            {show ? "Hide" : "Show"}
          </Button>
        }
      />
      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5 sm:p-6">
        {/* Hidden username field helps password managers associate the credentials correctly. */}
        <input type="text" name="username" autoComplete="username" hidden readOnly value="" />
        <TextField
          label="Current password"
          type={type}
          autoComplete="current-password"
          maxLength={128}
          value={values.currentPassword}
          onChange={(e) => update("currentPassword", e.target.value)}
          error={errors.currentPassword}
          hint={`Demo account password: ${DEMO_PASSWORD}`}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="New password"
            type={type}
            autoComplete="new-password"
            maxLength={128}
            value={values.newPassword}
            onChange={(e) => update("newPassword", e.target.value)}
            error={errors.newPassword}
          />
          <TextField
            label="Confirm new password"
            type={type}
            autoComplete="new-password"
            maxLength={128}
            value={values.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow">Demo · passwords are never stored</p>
          <Button type="submit" loading={saving}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}
