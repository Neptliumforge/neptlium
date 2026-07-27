'use client';
import { useState } from 'react';
import { Clock3, Wallet } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
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
}
type Tab = 'Overview' | 'Deposit' | 'Withdraw' | 'History' | 'Funding References';
const tabs: readonly Tab[] = ['Overview', 'Deposit', 'Withdraw', 'History', 'Funding References'];
const planned = ['USDC on Base', 'ETH on Base', 'BTC on Bitcoin'];
const tone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  pending: 'warning',
  pending_review: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
};
function Unavailable({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-10">
        <EmptyState
          icon={<Wallet className="size-5" aria-hidden="true" />}
          title={title}
          description={description}
        />
      </CardContent>
    </Card>
  );
}
export function WalletView({ transactions, historyError }: Props) {
  const [active, setActive] = useState<Tab>('Overview');
  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-lg font-semibold">Neptlium Wallet</h1>
        <p className="mt-1 text-sm text-text-muted">
          Crypto custody access and authenticated transaction history
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Custody balance" value="Unavailable" />
        <StatCard label="Provider status" value="Not connected" />
      </div>
      <div
        className="flex overflow-x-auto border-b border-border-hairline"
        role="tablist"
        aria-label="Wallet sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'text-text-muted'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {active === 'Overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Unavailable
            title="Provider not connected"
            description="No custody wallet has been confirmed or provisioned for this account."
          />
          <Card>
            <CardHeader>
              <CardTitle>Planned asset support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">Provider-dependent and not yet available.</p>
              <ul className="mt-3 space-y-2 text-sm">
                {planned.map((asset) => (
                  <li key={asset}>
                    {asset} <Badge tone="neutral">Planned</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      {active === 'Deposit' && (
        <Unavailable
          title="Deposit unavailable"
          description="Crypto deposits require a connected custody provider. No address or QR code is available."
        />
      )}
      {active === 'Withdraw' && (
        <Unavailable
          title="Withdraw unavailable"
          description="Customer withdrawal submission is disabled until custody, ledger, security, and execution infrastructure is connected."
        />
      )}
      {active === 'Funding References' && (
        <Unavailable
          title="Funding References unavailable"
          description="Funding references cannot be created until a custody provider is connected."
        />
      )}
      {active === 'History' && (
        <Card>
          <CardContent className="py-6">
            {historyError ? (
              <EmptyState
                icon={<Clock3 className="size-5" />}
                title="History unavailable"
                description="Authenticated transaction history could not be loaded."
              />
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={<Clock3 className="size-5" />}
                title="No transaction history"
                description="Authenticated provider-backed transactions will appear here when available."
              />
            ) : (
              <div className="divide-y divide-border-hairline">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm capitalize">{tx.type}</p>
                      <p className="text-xs text-text-muted">
                        {tx.asset} · {tx.network} · {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">
                        {Number(tx.amount).toLocaleString()} {tx.asset}
                      </p>
                      <Badge tone={tone[tx.status] ?? 'neutral'}>
                        {tx.status.replaceAll('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
