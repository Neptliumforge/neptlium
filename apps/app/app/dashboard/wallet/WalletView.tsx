'use client';
import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Clock3, Copy } from 'lucide-react';
import {
  AssetAmount,
  AssetIdentity,
  Badge,
  Button,
  Group,
  Money,
  Row,
  Section,
  Stack,
  Surface,
} from '@neptlium/ui';
export interface WalletTransaction {
  id: string;
  type: string;
  asset: string;
  network: string;
  amount: number;
  status: string;
  created_at: string;
}
interface Props {
  readonly transactions: readonly WalletTransaction[];
  readonly historyError: boolean;
  readonly capitalAccount?: {
    readonly destination: {
      readonly asset: 'USDC';
      readonly network: 'BASE-SEPOLIA';
      readonly address: string;
      readonly provider_state: string;
      readonly environment: 'testnet';
    };
    readonly balance?: {
      readonly available: string;
      readonly observedAt: string;
      readonly synchronizationState: 'provider_observed';
    };
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
  pending: 'warning',
  pending_review: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
};
export function WalletView({ transactions, historyError, capitalAccount }: Props) {
  const [active, setActive] = useState<Tab>('Overview');
  return (
    <Stack className="py-1">
      <header>
        <div className="flex items-center gap-2">
          <h1>Capital Account</h1>
          <Badge tone="warning">Testnet</Badge>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Funding, balances, and authenticated capital activity.
        </p>
      </header>
      <section className="space-y-4 border-b border-border-hairline pb-6">
        <div>
          <p className="text-xs text-text-muted">Total balance</p>
          <Money
            state="unavailable"
            className="mt-2 block text-[2.5rem] font-medium leading-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted">Available</p>
            <Money state="unavailable" className="mt-1 block" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Pending</p>
            <Money state="unavailable" className="mt-1 block" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setActive('Deposit')}>
            <ArrowDownToLine className="size-4" />
            Deposit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setActive('Withdraw')}>
            <ArrowUpFromLine className="size-4" />
            Withdraw
          </Button>
        </div>
      </section>
      <div
        className="flex overflow-x-auto border-b border-border-hairline"
        role="tablist"
        aria-label="Capital Account sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`min-h-11 shrink-0 px-4 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'text-text-muted'}`}
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
                {(capitalAccount ? assets.slice(0, 1) : assets).map(([asset, description]) => (
                  <Row key={asset}>
                    <AssetIdentity
                      asset={asset}
                      network={description.includes('Base') ? 'Base' : 'Bitcoin'}
                      detailed
                    />
                    {capitalAccount?.balance && asset === 'USDC' ? (
                      <span className="text-sm tabular-nums">
                        {capitalAccount.balance.available} test USDC
                      </span>
                    ) : (
                      <AssetAmount asset={asset} state="unavailable" className="text-sm" />
                    )}
                  </Row>
                ))}
              </Group>
            </Surface>
          </Section>
          {!capitalAccount && (
            <div className="py-5 text-center">
              <p className="text-sm font-medium">Account provisioning</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
                Your Capital Account is being prepared. Funding will become available when
                provisioning is complete.
              </p>
            </div>
          )}
          {capitalAccount?.balance && (
            <p className="text-xs text-text-muted">
              Provider-observed balance as of{' '}
              {new Date(capitalAccount.balance.observedAt).toLocaleString()}. This is not a
              reconciled Neptlium ledger balance and has no real-money value.
            </p>
          )}
        </>
      )}
      {active === 'Deposit' &&
        (capitalAccount ? (
          <Surface className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <AssetIdentity asset="USDC" network="Base Sepolia" detailed />
              <Badge tone="warning">Testnet only</Badge>
            </div>
            <p className="text-sm text-text-muted">
              Send only test USDC on Base Sepolia. A deposit is not complete until provider
              observation and Neptlium reconciliation occur.
            </p>
            <code className="block overflow-x-auto rounded bg-surface-2 p-3 text-sm">
              {capitalAccount.destination.address}
            </code>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(capitalAccount.destination.address)}
            >
              <Copy className="size-4" />
              Copy address
            </Button>
          </Surface>
        ) : (
          <State
            title="Deposits are not available yet"
            copy="Your testnet Capital Account has not been linked. Contact operations to provision it on demand."
          />
        ))}
      {active === 'Withdraw' && (
        <State
          title="Withdrawals are not available yet"
          copy="Withdrawal controls will become available after Capital Account provisioning and authorization controls are ready."
        />
      )}
      {active === 'History' && (
        <Section title="Activity">
          <Surface className="px-4 sm:px-5">
            {historyError ? (
              <p className="py-7 text-sm text-text-muted">
                Activity could not be loaded. Try again later.
              </p>
            ) : transactions.length === 0 ? (
              <p className="py-7 text-sm text-text-muted">
                No activity yet. Your Capital Account activity will appear here.
              </p>
            ) : (
              <Group>
                {transactions.map((tx) => (
                  <Row key={tx.id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <AssetIdentity asset={tx.asset} network={tx.network} size="sm" />
                      <div>
                        <p className="text-sm capitalize">{tx.type}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <AssetAmount
                        value={Number(tx.amount)}
                        asset={tx.asset as 'USDC' | 'ETH' | 'BTC'}
                        className="text-sm"
                      />
                      <div className="mt-1">
                        <Badge tone={tone[tx.status] ?? 'neutral'}>
                          {tx.status.replaceAll('_', ' ')}
                        </Badge>
                      </div>
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
    <Surface className="px-5 py-8 text-center">
      <Clock3 className="mx-auto size-5 text-text-muted" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{copy}</p>
    </Surface>
  );
}
