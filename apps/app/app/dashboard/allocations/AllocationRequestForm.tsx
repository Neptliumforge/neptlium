'use client';

import { useActionState, useEffect, useId, useState } from 'react';
import {
  AssetIdentity,
  Button,
  Field,
  FieldError,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@neptlium/ui';
import { submitAllocationRequestAction, type AllocationActionResult } from './actions';

export interface WalletOption {
  readonly id: string;
  readonly label: string;
}

export interface PortfolioOption {
  readonly id: string;
  readonly name: string;
}

export interface AssetNetworkPair {
  readonly assetCode: string;
  readonly assetLabel: string;
  readonly networkCode: string;
  readonly networkLabel: string;
}

export interface AllocationRequestFormProps {
  readonly wallets: readonly WalletOption[];
  readonly portfolios: readonly PortfolioOption[];
  readonly pairs: readonly AssetNetworkPair[];
}

const initialState: AllocationActionResult | null = null;

export function AllocationRequestForm({ wallets, portfolios, pairs }: AllocationRequestFormProps) {
  const formId = useId();
  const [state, formAction, isPending] = useActionState(
    submitAllocationRequestAction,
    initialState,
  );
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id ?? '');
  const [selectedPair, setSelectedPair] = useState(
    pairs[0] ? `${pairs[0].assetCode}::${pairs[0].networkCode}` : '',
  );
  const [selectedPortfolio, setSelectedPortfolio] = useState(portfolios[0]?.id ?? '');
  // Generate a stable idempotency key per form mount; reset on success
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (state?.ok) {
      setIdempotencyKey(crypto.randomUUID());
    }
  }, [state]);

  if (wallets.length === 0) {
    return (
      <p className="text-body-sm text-text-secondary">
        Your Capital Account is not ready for allocation requests.
      </p>
    );
  }

  if (pairs.length === 0) {
    return (
      <p className="text-body-sm text-text-secondary">No supported assets are configured yet.</p>
    );
  }

  const [selectedAsset, selectedNetwork] = selectedPair.split('::');

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="wallet_id" value={selectedWallet} />
      <input type="hidden" name="asset" value={selectedAsset} />
      <input type="hidden" name="network" value={selectedNetwork} />
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />

      {/* Wallet */}
      {wallets.length > 1 && (
        <Field>
          <Label htmlFor={`${formId}-wallet`}>Capital Account</Label>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger id={`${formId}-wallet`}>
              <SelectValue placeholder="Select Capital Account" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Portfolio */}
      {portfolios.length > 0 && (
        <Field>
          <Label htmlFor={`${formId}-portfolio`}>Portfolio</Label>
          <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
            <SelectTrigger id={`${formId}-portfolio`}>
              <SelectValue placeholder="Select portfolio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No portfolio</SelectItem>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="portfolio_id" value={selectedPortfolio} />
        </Field>
      )}

      {/* Asset and network */}
      <Field>
        <Label htmlFor={`${formId}-pair`}>Asset and network</Label>
        <Select value={selectedPair} onValueChange={setSelectedPair}>
          <SelectTrigger id={`${formId}-pair`}>
            <SelectValue placeholder="Select asset and network" />
          </SelectTrigger>
          <SelectContent>
            {pairs.map((pair) => (
              <SelectItem
                key={`${pair.assetCode}::${pair.networkCode}`}
                value={`${pair.assetCode}::${pair.networkCode}`}
              >
                <AssetIdentity
                  asset={pair.assetCode}
                  network={pair.networkCode}
                  size="sm"
                  detailed
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Amount */}
      <Field>
        <Label htmlFor={`${formId}-amount`}>Amount</Label>
        <Input
          id={`${formId}-amount`}
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          className="font-mono"
        />
      </Field>

      {/* Notes */}
      <Field>
        <Label htmlFor={`${formId}-notes`}>
          Notes <span className="font-normal text-text-muted">(optional)</span>
        </Label>
        <Input id={`${formId}-notes`} name="notes" placeholder="Purpose or mandate reference" />
        {state && !state.ok && <FieldError>{state.error}</FieldError>}
      </Field>

      {state?.ok && (
        <p className="text-body-sm text-success">
          Allocation request submitted and is pending review.
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        size="sm"
        className="w-full sm:w-fit"
        loading={isPending}
      >
        Submit for review
      </Button>
    </form>
  );
}
