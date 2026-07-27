"use client";

import { useState, useTransition } from "react";
import { Button } from "@neptlium/ui";
import { generateDepositAddressAction } from "./actions";

export interface AssetNetworkPair {
  readonly assetCode: string;
  readonly assetLabel: string;
  readonly networkCode: string;
  readonly networkLabel: string;
}

export interface GenerateAddressButtonProps {
  readonly pairs: readonly AssetNetworkPair[];
}

export function GenerateAddressButton({ pairs }: GenerateAddressButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const pair = pairs[0];

  if (!pair) return null;

  function handleClick() {
    if (!pair) return;
    setError(null);
    startTransition(async () => {
      const result = await generateDepositAddressAction(pair.assetCode, pair.networkCode);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} loading={isPending}>
        Request address
      </Button>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
