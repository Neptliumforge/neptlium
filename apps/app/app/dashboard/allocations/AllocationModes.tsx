'use client';

import { useState } from 'react';
import { Input, Label, Stack } from '@neptlium/ui';
import { ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';

type Mode = 'Observe' | 'Model' | 'Authorize';
const modes: readonly Mode[] = ['Observe', 'Model', 'Authorize'];

type ResourceState =
  | { readonly state: 'VALUE'; readonly value: unknown }
  | { readonly state: 'EMPTY' }
  | { readonly state: 'NOT_CONFIGURED'; readonly reason: string }
  | { readonly state: 'UNAVAILABLE'; readonly reason: string }
  | { readonly state: 'PENDING'; readonly reason: string };

export interface AllocationApiState {
  readonly observed: ResourceState;
  readonly modeled: ResourceState;
  readonly authorized: ResourceState;
  readonly executed: ResourceState;
  readonly reconciled: ResourceState;
}

const lifecycle = [
  ['Observed', 'observed'],
  ['Modeled', 'modeled'],
  ['Authorized', 'authorized'],
  ['Executed', 'executed'],
  ['Reconciled', 'reconciled'],
] as const;

function productState(state: ResourceState | undefined) {
  if (!state || state.state === 'UNAVAILABLE') return 'UNAVAILABLE' as const;
  if (state.state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED' as const;
  if (state.state === 'PENDING') return 'PENDING' as const;
  if (state.state === 'EMPTY') return 'NO_ACTIVITY' as const;
  return 'READY' as const;
}

function stateLabel(state: ResourceState | undefined) {
  if (!state || state.state === 'UNAVAILABLE') return 'Unavailable';
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No state yet';
  return 'Available';
}

export function AllocationModes({ state }: { readonly state: AllocationApiState | null }) {
  const [mode, setMode] = useState<Mode>('Observe');
  const [objective, setObjective] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Stack>
      <header>
        <h1>Allocation</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Observe capital distribution, model policy intent, and keep authorization, execution, and reconciliation explicitly separate.
        </p>
      </header>

      <ol className="grid border-y border-border-hairline sm:grid-cols-5" aria-label="Allocation lifecycle">
        {lifecycle.map(([label, key], index) => (
          <li key={label} className="border-b border-border-hairline py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0">
            <span className="text-[11px] tabular-nums text-accent-primary">0{index + 1}</span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <ProductStateBadge state={productState(state?.[key])}>{stateLabel(state?.[key])}</ProductStateBadge>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex border-b border-border-hairline" role="tablist" aria-label="Allocation workspace modes">
        {modes.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            className={`relative min-h-11 px-4 text-sm font-medium ${mode === item ? 'text-text-primary after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {mode === 'Observe' ? (
        <div className="border-y border-border-hairline py-6">
          {state === null ? (
            <ProductStateMessage state="ERROR" title="Allocation state unavailable">The Neptlium API could not load the current allocation state.</ProductStateMessage>
          ) : (
            <ProductStateMessage state={productState(state.observed)} title="Observed capital distribution">
              Observed state appears only when canonical portfolio evidence can establish it. No modeled value is substituted for what actually exists.
            </ProductStateMessage>
          )}
        </div>
      ) : null}

      {mode === 'Model' ? (
        <div className="border-y border-border-hairline py-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-text-primary">Modeled policy workspace</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Use this local draft to structure intent before a durable modeled-policy API exists. Nothing entered here is canonical, authorized, or executable.
            </p>
          </div>
          <div className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="allocation-objective">Objective</Label>
              <Input id="allocation-objective" value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="e.g. Preserve liquidity" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="allocation-notes">Policy notes</Label>
              <Input id="allocation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Constraints or review notes" className="mt-2" />
            </div>
          </div>
          <div className="mt-5 border-t border-border-hairline pt-4">
            <ProductStateBadge state="UNAVAILABLE">Execution unavailable</ProductStateBadge>
            <p className="mt-2 text-sm text-text-muted">Allocation execution remains out of scope until deposit, reservation, transfer, ledger, and reconciliation are production-proven.</p>
          </div>
        </div>
      ) : null}

      {mode === 'Authorize' ? (
        <div className="border-y border-border-hairline py-6">
          <ProductStateMessage state={state ? productState(state.authorized) : 'UNAVAILABLE'} title="Authorization">
            Authorization is API-owned. This frontend cannot advance modeled allocation into execution, settlement, or reconciliation.
          </ProductStateMessage>
        </div>
      ) : null}
    </Stack>
  );
}
