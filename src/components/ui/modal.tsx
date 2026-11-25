"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Prevents closing via Escape / backdrop, e.g. while a request is in flight. */
  preventClose?: boolean;
  size?: "sm" | "md";
}

/**
 * Accessible modal built on the native <dialog> element, which provides
 * focus trapping, Escape handling, inert background and top-layer rendering.
 */
export function Modal({ open, onClose, title, description, children, preventClose, size = "md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element (the close button);
      // move focus to the element the content marked as the preferred start.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!preventClose) onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget && !preventClose) onClose();
        pointerDownOnBackdrop.current = false;
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-surface p-0 text-foreground shadow-lg ring-1 ring-line",
        "open:animate-[dialog-in_260ms_var(--ease-out)]",
        size === "sm" ? "max-w-md" : "max-w-lg",
      )}
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-[-0.03em]">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={preventClose}
              className="-m-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
