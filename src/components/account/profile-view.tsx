"use client";

import { Briefcase, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/components/providers/profile-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { TextareaField, TextField } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { updateProfile } from "@/lib/api/account";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { profileSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import type { Profile } from "@/types";
import { PasswordForm } from "./password-form";

export function ProfileView() {
  const { profile, isLoading, error, reload } = useProfile();

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information and account security." />
      {error && !profile ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ProfileSummary profile={profile} loading={isLoading} />
          <div className="space-y-6 lg:col-span-2">
            {profile ? (
              <ProfileForm key={JSON.stringify(profile)} profile={profile} onSaved={reload} />
            ) : (
              <Card className="space-y-4 p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </Card>
            )}
            <PasswordForm />
          </div>
        </div>
      )}
    </>
  );
}

function ProfileSummary({ profile, loading }: { profile?: Profile; loading: boolean }) {
  return (
    <Card className="h-fit p-6">
      {loading || !profile ? (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar name={profile.name} seed="profile" size="lg" />
            <p className="mt-3 text-lg font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted">{profile.jobTitle || "Administrator"}</p>
            <span className="mt-3 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
              Workspace owner
            </span>
          </div>
          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            {[
              { icon: Mail, label: "Email", value: profile.email },
              { icon: Phone, label: "Phone", value: profile.phone },
              { icon: MapPin, label: "Location", value: profile.location },
              { icon: Briefcase, label: "Job title", value: profile.jobTitle },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-muted" aria-hidden />
                <dt className="sr-only">{label}</dt>
                <dd className="min-w-0 truncate text-foreground">{value || <span className="text-muted">Not set</span>}</dd>
              </div>
            ))}
          </dl>
          {profile.bio && <p className="mt-5 border-t border-line pt-5 text-sm text-muted">{profile.bio}</p>}
        </>
      )}
    </Card>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState<Profile>(profile);
  const [errors, setErrors] = useState<FieldErrors<Profile>>({});
  const [saving, setSaving] = useState(false);

  const dirty = (Object.keys(profile) as (keyof Profile)[]).some((k) => profile[k] !== values[k]);

  function update(key: keyof Profile, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setSaving(true);
    try {
      await updateProfile(parsed.data);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      onSaved();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors as FieldErrors<Profile>);
      toast({ title: "Couldn't save profile", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Personal information" description="This is how others see you across the workspace." />
      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Full name"
            required
            autoComplete="name"
            maxLength={60}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
          />
          <TextField
            label="Email address"
            required
            type="email"
            autoComplete="email"
            maxLength={254}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
          />
          <TextField
            label="Job title"
            autoComplete="organization-title"
            maxLength={60}
            value={values.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            error={errors.jobTitle}
          />
          <TextField
            label="Phone"
            type="tel"
            autoComplete="tel"
            maxLength={20}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
          />
          <TextField
            label="Location"
            autoComplete="address-level2"
            maxLength={80}
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            error={errors.location}
            wrapperClassName="sm:col-span-2"
          />
        </div>
        <TextareaField
          label="Bio"
          maxLength={280}
          value={values.bio}
          onChange={(e) => update("bio", e.target.value)}
          error={errors.bio}
          hint={`${values.bio.length}/280 characters`}
        />
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button
            variant="secondary"
            disabled={!dirty || saving}
            onClick={() => {
              setValues(profile);
              setErrors({});
            }}
          >
            Discard
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
