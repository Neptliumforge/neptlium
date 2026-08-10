'use client';

import { useState } from 'react';
import { Field, Input, Label, Stack, Surface } from '@neptlium/ui';

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

function stateLabel(state: ResourceState | undefined): string {
  if (!state || state.state === 'UNAVAILABLE') return 'Unavailable';
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No state yet';
  return 'Available';
}

export function AllocationModes({ state }: { readonly state: AllocationApiState | null }) {
  const [mode, setMode] = useState<Mode>('Observe');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <Stack>
      <header>
        <h1>Allocation</h1>
        <p className="mt-1 text-sm text-text-muted">Observe existing exposure, model a proposed state, and understand authorization readiness.</p>
        <p className="mt-2 text-sm font-medium text-accent-primary">Modeling does not move capital.</p>
      </header>

      <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border-hairline bg-border-hairline sm:grid-cols-5" aria-label="Allocation lifecycle">
        {lifecycle.map(([labelName, key], index) => (
          <li key={labelName} className="bg-surface-1 px-3 py-3">
            <span className="block text-[11px] text-accent-primary">0{index + 1}</span>
            <strong className="mt-2 block text-xs font-medium">{labelName}</strong>
            <small className="mt-1 block text-[11px] text-text-muted">{stateLabel(state?.[key])}</small>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-3 gap-0 border-b border-border-hairline" role="tablist" aria-label="Allocation modes">
        {modes.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            className={`relative min-h-11 px-3 text-sm font-medium ${mode === item ? 'text-text-primary after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {mode === 'Observe' && (
        <div className="border-y border-border-hairline py-7">
          <p className="text-sm font-medium">{state === null ? 'Allocation state is unavailable' : stateLabel(state.observed)}</p>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            {state === null
              ? 'The Neptlium API could not load the current allocation state. Try again later.'
              : 'Observed allocation is supplied only when canonical portfolio and supported evidence can establish it.'}
          </p>
        </div>
      )}

      {mode === 'Model' && (
        <Surface className="p-5">
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold">Illustrative local model</h2>
            <p className="mt-1 text-sm text-text-muted">This browser-local preview does not persist a policy, become the API modeled state, move capital, or call an execution provider.</p>
            <p className="mt-2 text-xs text-text-muted">Backend modeled state: {stateLabel(state?.modeled)}</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="scenario-label">Scenario label</Label>
              <Input id="scenario-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Illustrative scenario" />
            </Field>
            <Field>
              <Label htmlFor="scenario-amount">Illustrative asset units</Label>
              <Input id="scenario-amount" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter asset units" />
            </Field>
          </div>
          {(label || amount) && (
            <div className="mt-5 border-t border-border-hairline pt-4">
              <p className="text-xs text-text-muted">Local preview only</p>
              <p className="mt-1 text-sm">{label || 'Unnamed scenario'} · {amount || 'No amount entered'} · unspecified asset units</p>
            </div>
          )}
        </Surface>
      )}

      {mode === 'Authorize' && (
        <div className="border-y border-border-hairline py-7">
          <p className="text-sm font-medium">{state === null ? 'Authorization state is unavailable' : stateLabel(state.authorized)}</p>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">Authorization remains API-owned and cannot be advanced by this frontend. Execution and reconciliation remain distinct later states.</p>
        </div>
      )}
    </Stack>
  );
}
