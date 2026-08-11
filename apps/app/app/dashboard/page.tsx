import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Row, Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getOverviewState } from '@/lib/api/client';
import {
  getCanonicalBalances,
  getFundingActivity,
  getTransferActivity,
  type FundingActivity,
  type TransferActivity,
} from '@/lib/api/financial';
import { CapitalPosition } from '@/components/product/CapitalPosition';
import { FinancialValue, ProductStateBadge } from '@/components/product/ProductState';

function activityState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(state)) return 'ERROR' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

type RecentActivity =
  | ({ readonly kind: 'Deposit' } & FundingActivity)
  | ({ readonly kind: 'Transfer' } & TransferActivity);

export default async function DashboardPage() {
  await requireProvisionedUser();

  const [overviewResult, balancesResult, fundingResult, transferResult] = await Promise.allSettled([
    getOverviewState(),
    getCanonicalBalances(),
    getFundingActivity(),
    getTransferActivity(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const balances = balancesResult.status === 'fulfilled' ? balancesResult.value.balances : [];
  const balanceError = balancesResult.status === 'rejected';
  const funding = fundingResult.status === 'fulfilled' ? fundingResult.value.data : [];
  const transfers = transferResult.status === 'fulfilled' ? transferResult.value.data : [];
  const activityError = fundingResult.status === 'rejected' && transferResult.status === 'rejected';
  const recent: RecentActivity[] = [
    ...funding.map((item) => ({ ...item, kind: 'Deposit' as const })),
    ...transfers.map((item) => ({ ...item, kind: 'Transfer' as const })),
  ]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 5);

  return (
    <Stack>
      <header>
        <h1>Overview</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Canonical capital state, current operating readiness, and the items that need attention.
        </p>
      </header>

      <CapitalPosition balances={balances} loadError={balanceError} />

      <div className="grid gap-x-10 gap-y-2 lg:grid-cols-3">
        <Section title="Portfolio">
          <Link
            href="/dashboard/portfolio"
            className="group block border-b border-border-hairline py-5 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
          >
            <Row>
              <div>
                <p className="text-sm font-medium text-text-primary">Capital visibility</p>
                <p className="mt-1 text-sm text-text-muted">
                  {balances.length ? `${balances.length} canonical asset balance${balances.length === 1 ? '' : 's'}` : 'No portfolio positions yet.'}
                </p>
              </div>
              <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Row>
          </Link>
        </Section>

        <Section title="Treasury">
          <Link
            href="/dashboard/treasury"
            className="group block border-b border-border-hairline py-5 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
          >
            <Row>
              <div>
                <p className="text-sm font-medium text-text-primary">Liquidity and movement</p>
                <p className="mt-1 text-sm text-text-muted">
                  {overview?.treasury.state === 'VALUE' ? 'Canonical treasury state available' : 'Governed by canonical balances and capability state'}
                </p>
              </div>
              <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Row>
          </Link>
        </Section>

        <Section title="Allocation">
          <Link
            href="/dashboard/allocations"
            className="group block border-b border-border-hairline py-5 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
          >
            <Row>
              <div>
                <p className="text-sm font-medium text-text-primary">Policy workspace</p>
                <p className="mt-1 text-sm text-text-muted">Execution remains unavailable until governed execution is production-proven.</p>
              </div>
              <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Row>
          </Link>
        </Section>
      </div>

      <Section
        title="Recent activity"
        action={<Link href="/dashboard/transactions" className="text-sm font-medium text-accent-primary">See all</Link>}
      >
        <div className="border-y border-border-hairline">
          {activityError ? (
            <div className="py-6">
              <p className="text-sm font-medium text-text-primary">Activity unavailable</p>
              <p className="mt-1 text-sm text-text-muted">The Neptlium API could not load canonical activity.</p>
            </div>
          ) : recent.length === 0 ? (
            <div className="py-6">
              <p className="text-sm font-medium text-text-primary">No capital activity yet.</p>
              <p className="mt-1 text-sm text-text-muted">Funding and governed movement will appear here when canonical intents exist.</p>
            </div>
          ) : (
            recent.map((item) => (
              <div key={`${item.kind}:${item.id}`} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{item.kind} · {item.asset}</p>
                  <p className="mt-1 truncate text-xs text-text-muted">{item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div className="text-sm font-medium">
                  {'amount_atomic' in item && item.amount_atomic
                    ? <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} />
                    : <span className="text-text-muted">Amount unavailable</span>}
                </div>
                <ProductStateBadge state={activityState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge>
              </div>
            ))
          )}
        </div>
      </Section>
    </Stack>
  );
}
