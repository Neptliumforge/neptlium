"use client";

import { useState, useTransition } from "react";
import { Button } from "@neptlium/ui";
import { revokeOtherSessionsAction } from "@/components/security/actions";

export function RevokeSessionsButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ readonly ok: boolean; readonly message: string } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const outcome = await revokeOtherSessionsAction();
      setResult(
        outcome.ok
          ? { ok: true, message: "Every other session has been signed out." }
          : { ok: false, message: outcome.error }
      );
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} loading={isPending}>
        Sign out of other devices
      </Button>
      {result && (
        <p className={`text-body-sm ${result.ok ? "text-accent-emerald" : "text-danger"}`}>{result.message}</p>
      )}
    </div>
  );
}
