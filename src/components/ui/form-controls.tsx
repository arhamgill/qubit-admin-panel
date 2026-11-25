"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-lg border bg-surface text-sm text-foreground placeholder:text-muted/70 transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-60";

function controlState(invalid: boolean) {
  return invalid ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-line";
}

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({ id, label, error, hint, required, hideLabel, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className={cn("block text-sm font-medium text-foreground", hideLabel && "sr-only")}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type BaseFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  wrapperClassName?: string;
};

export function TextField({
  label,
  error,
  hint,
  hideLabel,
  wrapperClassName,
  className,
  required,
  ...props
}: BaseFieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={wrapperClassName}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlBase, controlState(!!error), "h-10 px-3", className)}
        {...props}
      />
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  hideLabel,
  wrapperClassName,
  className,
  required,
  ...props
}: BaseFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={wrapperClassName}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlBase, controlState(!!error), "min-h-24 resize-y px-3 py-2", className)}
        {...props}
      />
    </FieldWrapper>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  label,
  error,
  hint,
  hideLabel,
  wrapperClassName,
  className,
  options,
  required,
  ...props
}: BaseFieldProps & React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly SelectOption[] }) {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={wrapperClassName}>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlBase, controlState(!!error), "h-10 appearance-none pr-9 pl-3", className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </FieldWrapper>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium text-foreground">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60",
          checked ? "bg-primary" : "bg-line",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
