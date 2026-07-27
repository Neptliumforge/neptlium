"use client";

import { useState } from "react";
import { Bitcoin, CheckCircle2, Copy, Landmark } from "lucide-react";
import { Badge, Button } from "@neptlium/ui";

export interface DepositAddress {
  id: string;
  asset: string;
  network: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface DepositPanelProps {
  existingAddresses: DepositAddress[];
  walletId: string | null;
}

function AddressCard({ addr }: { addr: DepositAddress }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(addr.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-md border border-border-default bg-surface-2 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-primary">{addr.asset}</span>
          <span className="text-[12px] text-text-muted">·</span>
          <span className="text-[12px] text-text-muted">{addr.network}</span>
        </div>
        <Badge tone={addr.status === "active" ? "success" : "neutral"}>
          {addr.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-1 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-text-primary">
          {addr.address}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-sm bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          {copied ? (
            <>
              <CheckCircle2 className="size-3 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-text-muted">
        Only send USD via unsupported transfer to this reference.
      </p>
    </div>
  );
}

export function DepositPanel({ existingAddresses, walletId }: DepositPanelProps) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] font-semibold text-text-primary">Deposit funds</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card 1: USD Wire — Available */}
        <div className="rounded-lg border border-border-default bg-surface-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/12">
              <Landmark className="size-4 text-success" />
            </div>
            <Badge tone="success">Available</Badge>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-primary">Unsupported funding rail</p>
            <p className="mt-1 text-[12px] text-text-muted leading-relaxed">
              Send a unsupported transfer to your Neptlium wallet funding reference.
            </p>
          </div>

          {existingAddresses.length > 0 ? (
            <div className="space-y-2">
              {existingAddresses.map((addr) => (
                <AddressCard key={addr.id} addr={addr} />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-text-muted rounded-md border border-border-default bg-surface-2 px-3 py-2.5">
              No funding references generated. Use the button below to create one.
            </p>
          )}

          <Button variant="outline" size="sm" href="/dashboard/wallet">
            Manage funding references
          </Button>
        </div>

        {/* Card 2: Crypto — Coming soon */}
        <div className="rounded-lg border border-border-default bg-surface-1 p-4 space-y-3 opacity-60 cursor-not-allowed select-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3">
              <Bitcoin className="size-4 text-text-muted" />
            </div>
            <Badge tone="neutral">Coming soon</Badge>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-primary">Crypto deposits</p>
            <p className="mt-1 text-[12px] text-text-muted leading-relaxed">
              BTC, ETH, USDC, USDT, and other digital assets.
            </p>
          </div>
          <p className="text-[12px] text-text-muted">
            Crypto deposits are not yet available. You will be notified when this feature launches.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border-default bg-surface-2 px-4 py-3">
        <p className="text-[12px] text-text-muted leading-relaxed">
          Deposits are credited after confirmation by the operations team. Provider settlement is unavailable.
        </p>
      </div>
    </div>
  );
}

// Keep legacy export name for any existing imports
export { DepositPanel as CryptoDepositFlow };
