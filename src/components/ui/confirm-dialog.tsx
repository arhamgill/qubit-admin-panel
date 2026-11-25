"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  /**
   * Error from the last attempt. Shown inside the dialog: an open modal sits in the
   * browser's top layer and makes the page inert, so a toast would be hidden behind it.
   */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description} preventClose={loading} size="sm">
      {error && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {/* Cancel gets initial focus, so a stray Enter never confirms a destructive action. */}
        <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {error ? "Try again" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
