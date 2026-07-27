"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@neptlium/ui";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  readonly trigger: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly destructive?: boolean;
  readonly onConfirm: () => Promise<void>;
  readonly reasonField?: boolean;
  readonly reasonLabel?: string;
  readonly onReasonConfirm?: (reason: string) => Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  reasonField = false,
  reasonLabel = "Reason",
  onReasonConfirm
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    if (reasonField && onReasonConfirm) {
      if (!reason.trim()) {
        setError("Please provide a reason.");
        return;
      }
      startTransition(async () => {
        await onReasonConfirm(reason.trim());
        setOpen(false);
        setReason("");
      });
    } else {
      startTransition(async () => {
        await onConfirm();
        setOpen(false);
      });
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-[400px] rounded-xl border border-border-default bg-surface-overlay p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                className="shrink-0 rounded-md p-1 text-text-muted hover:text-text-primary"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-[13px] text-text-muted leading-relaxed">{description}</p>

            {reasonField && (
              <div className="mt-4">
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {reasonLabel}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason…"
                  rows={3}
                  disabled={isPending}
                  className="w-full rounded-md border border-border-default bg-surface-1 px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none resize-none"
                />
                {error && <p className="mt-1 text-[12px] text-danger-text">{error}</p>}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant={destructive ? "destructive" : "primary"}
                size="sm"
                onClick={handleConfirm}
                loading={isPending}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
