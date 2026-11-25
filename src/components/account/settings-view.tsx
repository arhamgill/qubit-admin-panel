"use client";

import { Check, Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/components/providers/profile-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { SelectField, Switch } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { useTheme } from "@/hooks/use-theme";
import { getSettings, resetDemoData, updateSettings } from "@/lib/api/account";
import { getErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { TIMEZONES } from "@/lib/validation";
import type { NotificationSettings, Settings, ThemePreference } from "@/types";

export function SettingsView() {
  const { data, error, isInitialLoading, reload } = useApiQuery("settings", getSettings);

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Preferences"
        title="Settings"
        description="Personalise how the dashboard looks and what you get notified about."
      />
      <div className="space-y-5">
        <AppearanceCard />
        {error && !data ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : isInitialLoading || !data ? (
          <Card className="space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </Card>
        ) : (
          <SettingsForm key={JSON.stringify(data)} settings={data} onSaved={reload} />
        )}
        <DangerZone onReset={reload} />
      </div>
    </>
  );
}

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function AppearanceCard() {
  const [theme, setTheme] = useTheme();
  return (
    <Card>
      <CardHeader title="Appearance" description="Applies instantly and is remembered on this device." titleId="appearance-title" />
      <div role="radiogroup" aria-labelledby="appearance-title" className="grid grid-cols-3 gap-3 p-5 sm:p-6">
        {THEMES.map(({ value, label, icon: Icon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 rounded-xl p-4 text-sm font-medium transition-[background-color,box-shadow,color] duration-200 ease-out",
                selected
                  ? "bg-surface text-foreground shadow-md ring-[1.5px] ring-foreground"
                  : "bg-background/60 text-ink-2 ring-1 ring-line hover:bg-surface hover:text-foreground hover:ring-line-strong",
              )}
            >
              {selected && (
                <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-[4px] bg-accent text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
              )}
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

const NOTIFICATIONS: { key: keyof NotificationSettings; label: string; description: string }[] = [
  { key: "securityAlerts", label: "Security alerts", description: "Sign-ins from new devices and permission changes." },
  { key: "newUserSignups", label: "New user sign-ups", description: "An email whenever someone joins the workspace." },
  { key: "weeklyReport", label: "Weekly report", description: "A summary of revenue and user growth every Monday." },
  { key: "productUpdates", label: "Product updates", description: "News about features and improvements." },
];

function SettingsForm({ settings, onSaved }: { settings: Settings; onSaved: () => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    try {
      await updateSettings(draft);
      toast({ title: "Settings saved" });
      onSaved();
    } catch (error) {
      toast({ title: "Couldn't save settings", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader title="Notifications" description="Choose which emails you'd like to receive." />
        <div className="divide-y divide-line px-5 pt-2 pb-3 sm:px-6">
          {NOTIFICATIONS.map(({ key, label, description }) => (
            <Switch
              key={key}
              label={label}
              description={description}
              checked={draft.notifications[key]}
              onChange={(checked) =>
                setDraft((d) => ({ ...d, notifications: { ...d.notifications, [key]: checked } }))
              }
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Region" description="Weekly reports and email digests are sent in this timezone." />
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <SelectField
            label="Timezone"
            value={draft.timezone}
            options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))}
            onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value as Settings["timezone"] }))}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
          <Button variant="secondary" disabled={!dirty || saving} onClick={() => setDraft(settings)}>
            Discard
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save settings
          </Button>
        </div>
      </Card>
    </form>
  );
}

function DangerZone({ onReset }: { onReset: () => void }) {
  const toast = useToast();
  const { reload: reloadProfile } = useProfile();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleReset() {
    setResetting(true);
    setResetError(null);
    try {
      await resetDemoData();
      setConfirming(false);
      reloadProfile();
      onReset();
      toast({ title: "Demo data reset", description: "Users, profile, settings and layout were restored to their defaults." });
    } catch (error) {
      // Shown inside the dialog; a toast would be hidden behind the open modal.
      setResetError(getErrorMessage(error));
    } finally {
      setResetting(false);
    }
  }

  return (
    <Card className="ring-danger/25">
      <CardHeader title="Demo data" description="All data lives in your browser. Reset it to start fresh." />
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-muted">Restores the original users, profile, settings, theme and layout.</p>
        <Button
          variant="secondary"
          onClick={() => {
            setResetError(null);
            setConfirming(true);
          }}
          className="text-danger"
        >
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
          Reset demo data
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Reset all demo data?"
        description="Any users you've added, edited or deleted, plus your profile, settings, theme and sidebar layout, will be restored to their defaults."
        confirmLabel="Reset data"
        loading={resetting}
        error={resetError}
        onConfirm={handleReset}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  );
}
