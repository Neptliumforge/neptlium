"use client";

import { useState } from "react";
import { Check, Copy, AlertTriangle } from "lucide-react";
import { Badge, Button } from "@neptlium/ui";
import type { CustodyAddress } from "@neptlium/lib";

export interface DepositAddressCardProps {
  readonly address: CustodyAddress;
}

function truncate(str: string, maxLen = 20): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor((maxLen - 3) / 2);
  return str.slice(0, half) + "…" + str.slice(str.length - half);
}

export function DepositAddressCard({ address }: DepositAddressCardProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayAddress = revealed ? address.address : truncate(address.address, 24);

  return (
    <div className="rounded-lg border border-border-default bg-surface-1 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-semibold text-text-primary">
            {address.asset}
          </span>
          <span className="text-body-sm text-text-muted">&middot;</span>
          <span className="text-body-sm text-text-secondary">{address.network}</span>
        </div>
        <Badge tone={address.status === "active" ? "success" : address.status === "suspended" ? "danger" : "neutral"}>
          {address.status}
        </Badge>
      </div>

      {/* Address row */}
      <div className="mt-3 flex items-center gap-2">
        <code
          className="min-w-0 flex-1 truncate rounded bg-surface-2 px-2.5 py-1.5 font-mono text-body-sm text-text-primary"
          title={address.address}
        >
          {displayAddress}
        </code>

        {!revealed && address.address.length > 24 && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="shrink-0 text-body-sm text-accent-primary hover:underline"
          >
            Show
          </button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="shrink-0"
          aria-label={copied ? "Copied" : "Copy address"}
        >
          {copied ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Safety notice for active funding references */}
      {address.status === "active" && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-text-muted">
          <AlertTriangle className="mt-0.5 size-3 shrink-0 text-warning" aria-hidden="true" />
          Only send {address.asset} via {address.network}. Other assets will not be credited.
        </p>
      )}

      {/* Created date */}
      <p className="mt-2 text-[11px] text-text-muted">
        Created {new Date(address.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
      </p>
    </div>
  );
}
