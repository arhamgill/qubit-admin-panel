"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id" | "variant"> & { variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toasts use the dark "product panel" surface, so the status colours are the on-dark shades.
const ICONS = {
  success: <CheckCircle2 className="size-[18px] text-[#5fd394]" strokeWidth={2} aria-hidden />,
  error: <XCircle className="size-[18px] text-[#ff8a7a]" strokeWidth={2} aria-hidden />,
  info: <Info className="size-[18px] text-accent" strokeWidth={2} aria-hidden />,
};

const DURATION_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ variant = "success", ...rest }) => {
      const id = nextId.current++;
      // Keep at most 4 toasts on screen.
      setToasts((list) => [...list.slice(-3), { id, variant, ...rest }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-panel p-3.5 pr-3 text-panel-foreground shadow-lg ring-1 ring-white/5",
              "animate-[toast-in_320ms_var(--ease-out)]",
            )}
          >
            <span className="mt-px">{ICONS[t.variant]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tracking-[-0.01em]">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] text-panel-muted">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-0.5 rounded-md p-1 text-panel-muted transition-colors hover:bg-white/10 hover:text-panel-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context.toast;
}
