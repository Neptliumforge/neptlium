'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Copy } from 'lucide-react';
import {
  AssetAmount,
  AssetIdentity,
  Badge,
  Button,
  Group,
  Row,
  Section,
  Stack,
  Surface,
} from '@neptlium/ui';

export interface WalletTransaction {
  readonly id: string;
  readonly type: string;
  readonly asset: string;
  readonly network: string;
  readonly amount: string;
  readonly status: string;
  readonly reference: string | null;
  readonly counterparty: string | null;
  readonly createdAt: string;
}

type ResourceState<T = never> =
  | { readonly state: 'VALUE'; readonly value: T }
  | { readonly state: 'EMPTY' }
  | { readonly state: 'NOT_CONFIGURED'; readonly reason: string }
  | { readonly state: 'UNAVAILABLE'; readonly reason: string }
  | { readonly state: 'PENDING'; readonly reason: string };

interface CapitalAccountState {
  readonly canonical: {
    readonly total: ResourceState;
    readonly available: ResourceState;
    readonly reserved: ResourceState;
    readonly pending: ResourceState;
  };
  readonly provider_observation: ResourceState<{
    readonly balances: ReadonlyArray<{
      readonly asset: 'USDC';
      readonly network: 'BASE-SEPOLIA';
      readonly available: string;
      readonly observedAt: string;
      readonly synchronizationState: 'provider_observed';
    }>;
    readonly reconciliation_state: string;
    readonly environment: 'testnet';
  }>;
  readonly funding: ResourceState<{ readonly environment: 'testnet' }>;
}

interface Props {
  readonly transactions: readonly WalletTransaction[];
  readonly historyError: boolean;
  readonly stateError: boolean;
  readonly capitalAccount: CapitalAccountState | null;
  readonly destination?: {
    readonly asset: 'USDC';
    readonly network: 'BASE-SEPOLIA';
    readonly address: string;
    readonly provider_state: string;
    readonly environment: 'testnet';
  };
}

type Tab = 'Overview' | 'Deposit' | 'Withdraw' | 'History';
const tabs: readonly Tab[] = ['Overview', 'Deposit', 'Withdraw', 'History'];
const assets = [
  ['USDC', 'USD Coin · Base'],
  ['ETH', 'Ethereum · Base'],
  ['BTC', 'Bitcoin'],
] as const;
const tone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  settled: 'success',
  pending: 'warning',
  pending_review: 'warning',
  confirming: 'warning',
  submitted: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
  reversed: 'danger',
};

function stateText(state: ResourceState | undefined): string {
  if (!state || state.state === 'UNAVAILABLE') return 'Unavailable';
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No data yet';
  return 'Available';
}

export function WalletView({
  transactions,
  historyError,
  stateError,
  capitalAccount,
  destination,
}: Props) {
  const [active, setActive] = useState<Tab>('Overview');
  const observed =
    capitalAccount?.provider_observation.state === 'VALUE'
      ? capitalAccount.provider_observation.value.balances[0]
      : undefined;

  return (
    <Stack className="py-1">
      <header>
        <div className="flex items-center gap-2">
          <h1>Capital Account</h1>
          {capitalAccount?.funding.state === 'VALUE' && <Badge tone="warning">Testnet</Badge>}
        </div>
        <p className="mt-1 text-sm text-text-muted">Controlled capital state, funding capability, and account activity.</p>
      </header>

      <section className="border-y border-border-hairline py-6">
        {stateError ? (
          <div>
            <p className="text-sm font-medium">Capital Account state is unavailable</p>
            <p className="mt-1 text-sm text-text-muted">The Neptlium API could not load the current account state. Try again later.</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Total capital</p>
              <span className="mt-2 block text-[2.5rem] font-medium leading-none sm:text-[2.75rem]">{stateText(capitalAccount?.canonical.total)}</span>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-4">
              {[
                ['Available', capitalAccount?.canonical.available],
                ['Reserved', capitalAccount?.canonical.reserved],
                ['Pending', capitalAccount?.canonical.pending],
              ].map(([label, state]) => (
                <div key={label as string}>
                  <dt className="text-xs text-text-muted">{label as string}</dt>
                  <dd className="mt-1 text-sm font-medium sm:text-base">{stateText(state as ResourceState | undefined)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setActive('Deposit')} disabled={!destination}>
            <ArrowDownToLine className="size-4" />
            Deposit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setActive('Withdraw')} disabled>
            <ArrowUpFromLine className="size-4" />
            Withdraw
          </Button>
        </div>
      </section>

      <div className="flex overflow-x-auto border-b border-border-hairline" role="tablist" aria-label="Capital Account sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`min-h-11 shrink-0 px-4 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === 'Overview' && (
        <>
          <Section title="Assets">
            <Surface className="px-4 sm:px-5">
              <Group>
                {(observed ? assets.slice(0, 1) : assets).map(([asset, description]) => (
                  <Row key={asset}>
                    <AssetIdentity asset={asset} network={description.includes('Base') ? 'Base' : 'Bitcoin'} detailed />
                    {observed && asset === 'USDC' ? (
                      <div className="text-right">
                        <span className="text-sm font-medium tabular-nums">{observed.available} test USDC</span>
                        <p className="mt-1 text-xs text-text-muted">Provider observed · unreconciled</p>
                      </div>
                    ) : (
                      <span className="text-sm text-text-muted">Unavailable</span>
                    )}
                  </Row>
                ))}
              </Group>
            </Surface>
          </Section>

          {capitalAccount?.provider_observation.state === 'NOT_CONFIGURED' && (
            <div className="border-y border-border-hairline py-6">
              <p className="text-sm font-medium">Account provisioning</p>
              <p className="mt-1 max-w-xl text-sm text-text-muted">Your provider-backed testnet Capital Account is not linked. Funding capability remains not configured.</p>
            </div>
          )}

          {observed && (
            <p className="text-xs leading-5 text-text-muted">
              Provider-observed balance as of {new Date(observed.observedAt).toLocaleString()}. This is not a reconciled Neptlium ledger balance and has no real-money value.
            </p>
          )}
        </>
      )}

      {active === 'Deposit' &&
        (destination ? (
          <Surface className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <AssetIdentity asset="USDC" network="Base Sepolia" detailed />
              <Badge tone="warning">Testnet only</Badge>
            </div>
            <p className="text-sm text-text-muted">Send only test USDC on Base Sepolia. A deposit is not canonical capital until observation, internal accounting, and reconciliation establish it.</p>
            <code className="block overflow-x-auto rounded-md bg-surface-2 p-3 text-sm">{destination.address}</code>
            <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(destination.address)}>
              <Copy className="size-4" />
              Copy address
            </Button>
          </Surface>
        ) : (
          <State title="Deposits are not available" copy="The Neptlium API has not returned an enabled funding destination for this account." />
        ))}

      {active === 'Withdraw' && (
        <State title="Withdrawals are not available" copy="Withdrawal execution remains disabled until durable authorization, reservation, provider execution, and reconciliation controls are ready." />
      )}

      {active === 'History' && (
        <Section title="Capital activity">
          <Surface className="px-4 sm:px-5">
            {historyError ? (
              <p className="py-7 text-sm text-text-muted">Capital activity could not be loaded. Try again later.</p>
            ) : transactions.length === 0 ? (
              <div className="py-7">
                <p className="text-sm font-medium">No capital activity yet.</p>
                <p className="mt-1 text-sm text-text-muted">Activity will appear here when account events are available.</p>
              </div>
            ) : (
              <Group>
                {transactions.map((tx) => (
                  <Row key={tx.id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <AssetIdentity asset={tx.asset} network={tx.network} size="sm" />
                      <div>
                        <p className="text-sm capitalize">{tx.type}</p>
                        <p className="text-xs text-text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <AssetAmount value={Number(tx.amount)} asset={tx.asset as 'USDC' | 'ETH' | 'BTC'} className="text-sm" />
                      <div className="mt-1"><Badge tone={tone[tx.status] ?? 'neutral'}>{tx.status.replaceAll('_', ' ')}</Badge></div>
                    </div>
                  </Row>
                ))}
              </Group>
            )}
          </Surface>
        </Section>
      )}
    </Stack>
  );
}

function State({ title, copy }: { readonly title: string; readonly copy: string }) {
  return (
    <div className="border-y border-border-hairline py-7">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-xl text-sm text-text-muted">{copy}</p>
    </div>
  );
}
