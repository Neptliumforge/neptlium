"use client";

import { useActionState, useMemo, useState } from "react";
import { Button, Field, FieldError, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@neptlium/ui";
import { requestWithdrawalAction, type WithdrawalResult } from "./actions";
import type { AssetNetworkPair } from "./GenerateAddressButton";

export interface WithdrawalFormProps {
  readonly pairs: readonly AssetNetworkPair[];
}

const initialState: WithdrawalResult | null = null;

export function WithdrawalForm({ pairs }: WithdrawalFormProps) {
  const [state, formAction, isPending] = useActionState(requestWithdrawalAction, initialState);
  const [selectedKey, setSelectedKey] = useState(pairs[0] ? `${pairs[0].assetCode}::${pairs[0].networkCode}` : "");
  const idempotencyKey = useMemo(() => globalThis.crypto.randomUUID(), []);

  if (pairs.length === 0) {
    return <p className="text-body-sm text-text-secondary">No supported withdrawal assets are configured yet.</p>;
  }

  const [selectedAsset, selectedNetwork] = selectedKey.split("::");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="asset" value={selectedAsset} />
      <input type="hidden" name="network" value={selectedNetwork} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <Field>
        <Label htmlFor="withdrawal-asset">Asset and network</Label>
        <Select value={selectedKey} onValueChange={setSelectedKey}>
          <SelectTrigger id="withdrawal-asset"><SelectValue placeholder="Select asset and network" /></SelectTrigger>
          <SelectContent>{pairs.map((pair) => <SelectItem key={`${pair.assetCode}::${pair.networkCode}`} value={`${pair.assetCode}::${pair.networkCode}`}>{pair.assetLabel} &middot; {pair.networkLabel}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field><Label htmlFor="withdrawal-amount">Amount</Label><Input id="withdrawal-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" /></Field>
      <Field><Label htmlFor="withdrawal-destination">Verified withdrawal address</Label><Input id="withdrawal-destination" name="destination" placeholder="Select or paste a verified destination" /><FieldError>{state && !state.ok ? state.error : null}</FieldError></Field>
      <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs leading-5 text-text-secondary">Withdrawals enter pending review and are not completed until authorized operations or provider confirmation finalizes execution.</p>
      {state?.ok && <p className="text-body-sm text-accent-primary">Withdrawal request submitted for review.</p>}
      <Button type="submit" variant="accent" size="sm" className="w-fit" loading={isPending}>Request review</Button>
    </form>
  );
}
