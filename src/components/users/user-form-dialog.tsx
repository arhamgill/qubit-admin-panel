"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { createUser, updateUser } from "@/lib/api/users";
import { toFieldErrors, userInputSchema, type FieldErrors } from "@/lib/validation";
import type { User, UserInput } from "@/types";

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer: read-only access" },
  { value: "editor", label: "Editor: can manage content" },
  { value: "admin", label: "Admin: full access" },
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
] as const;

const EMPTY: UserInput = { name: "", email: "", role: "viewer", status: "active", location: "" };

interface UserFormDialogProps {
  open: boolean;
  /** When provided the dialog edits this user; otherwise it creates a new one. */
  user?: User | null;
  onClose: () => void;
  onSaved: (user: User, mode: "create" | "edit") => void;
}

export function UserFormDialog({ open, user, onClose, onSaved }: UserFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const mode = user ? "edit" : "create";

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={submitting}
      title={mode === "edit" ? "Edit user" : "Add new user"}
      description={mode === "edit" ? "Update this user's details and access." : "Invite a new member to your workspace."}
    >
      {/* Keyed so the form resets whenever a different user is opened. */}
      <UserForm
        key={user?.id ?? "new"}
        user={user}
        mode={mode}
        submitting={submitting}
        setSubmitting={setSubmitting}
        onCancel={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

interface UserFormProps {
  user?: User | null;
  mode: "create" | "edit";
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  onCancel: () => void;
  onSaved: (user: User, mode: "create" | "edit") => void;
}

function UserForm({ user, mode, submitting, setSubmitting, onCancel, onSaved }: UserFormProps) {
  const [values, setValues] = useState<UserInput>(() =>
    user
      ? { name: user.name, email: user.email, role: user.role, status: user.status, location: user.location }
      : EMPTY,
  );
  const [errors, setErrors] = useState<FieldErrors<UserInput>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const parsed = userInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      const saved = mode === "edit" && user ? await updateUser(user.id, parsed.data) : await createUser(parsed.data);
      onSaved(saved, mode);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as FieldErrors<UserInput>);
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}
      <TextField
        label="Full name"
        required
        data-autofocus
        autoComplete="off"
        maxLength={60}
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        placeholder="e.g. Sara Khan"
      />
      <TextField
        label="Email address"
        required
        type="email"
        inputMode="email"
        autoComplete="off"
        maxLength={254}
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
        placeholder="name@company.com"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Role"
          required
          value={values.role}
          options={ROLE_OPTIONS}
          onChange={(e) => update("role", e.target.value as UserInput["role"])}
          error={errors.role}
        />
        <SelectField
          label="Status"
          required
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={(e) => update("status", e.target.value as UserInput["status"])}
          error={errors.status}
        />
      </div>
      <TextField
        label="Location"
        autoComplete="off"
        maxLength={80}
        value={values.location}
        onChange={(e) => update("location", e.target.value)}
        error={errors.location}
        hint="Optional"
        placeholder="e.g. Lahore, PK"
      />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "edit" ? "Save changes" : "Add user"}
        </Button>
      </div>
    </form>
  );
}
