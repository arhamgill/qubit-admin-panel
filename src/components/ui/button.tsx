import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground shadow-btn hover:bg-primary-hover hover:shadow-btn-hover",
  secondary:
    "bg-surface text-foreground shadow-sm ring-1 ring-line-strong ring-inset hover:ring-muted hover:shadow-md",
  ghost: "text-ink-2 hover:bg-foreground/5 hover:text-foreground",
  danger: "bg-danger-solid text-white shadow-sm hover:bg-danger-hover",
  /** Reserved for the single most important call to action on a screen. */
  accent:
    "bg-accent-solid text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(20,20,19,0.2),0_4px_12px_-4px_rgba(200,70,26,0.45)] hover:bg-accent-solid-hover",
} as const;

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "size-9 justify-center",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-medium tracking-[-0.01em] whitespace-nowrap",
        "transition-[background-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
