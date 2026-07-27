"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@neptlium/ui";
import { getSignedDownloadUrlAction } from "./actions";

export interface DownloadButtonProps {
  readonly documentId: string;
}

export function DownloadButton({ documentId }: DownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getSignedDownloadUrlAction(documentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} loading={isPending}>
        <Download className="size-3.5" aria-hidden="true" /> Download
      </Button>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
