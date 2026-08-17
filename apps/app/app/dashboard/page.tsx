import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getOverviewState } from '@/lib/api/client';
import {
  getCanonicalBalances,
  getFundingActivity,
  getFundingCapabilities,
  getTransferActivity,
  type FundingActivity,
  type TransferActivity,
} from '@/lib/api/financial';
import { CapitalPosition } from '@/components/product/CapitalPosition';
import { FinancialValue, ProductStateBadge } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

function activityState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(state)) return 'ERROR' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

function normalizedNetwork(value: string | null | undefined) {
  return (value ?? '').replaceAll('-', '_').toUpperCase();
}

function balanceState(balance: {
  readonly available_atomic: string;
  readonly pending_atomic: string;
  readonly reserved_atomic: string;
  readonly restricted_atomic: string;
} | undefined) {
  if (!balance) return 'No position';
  if (BigInt(balance.restricted_atomic) > 0n) return 'Restricted';
  if (BigInt(balance.pending_atomic) > 0n) return 'Pending';
  if (BigInt(balance.reserved_atomic) > 0n) return 'Reserved';
  return 'Available';
}

type RecentActivity =
  | ({ readonly kind: 'Deposit' } & FundingActivity)
  | ({ readonly kind: 'Transfer' } & TransferActivity);

export default async function DashboardPage() {
  await requireProvisionedUser();

  const [overviewResult, balancesResult, capabilitiesResult, fundingResult, transferResult] = await Promise.allSettled([
    getOverviewState(),
    getCanonicalBalances(),
    getFundingCapabilities(),
    getFundingActivity(),
    getTransferActivity(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const balances = balancesResult.status === 'fulfilled' ? balancesResult.value.balances : [];
  const capabilities = capabilitiesResult.status === 'fulfilled' ? capabilitiesResult.value.capabilities : [];
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

  const pendingApprovals = transfers.filter((item) => item.state === 'PENDING_APPROVAL');
  const attention = [
    ...(balanceError ? [{ title: 'Capital state could not be loaded', href: '/dashboard/wallet', label: 'Review Capital Account' }] : []),
    ...(activityError ? [{ title: 'Capital activity could not be loaded', href: '/dashboard/transactions', label: 'Review activity' }] : []),
    ...(pendingApprovals.length
      ? [{
          title: `${pendingApprovals.length} transfer${pendingApprovals.length === 1 ? '' : 's'} awaiting approval`,
          href: '/dashboard/treasury',
          label: 'Review Treasury',
        }]
      : []),
  ];

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Capital operating environment"
        title="Overview"
        description="What matters across your capital, operating readiness, and governed activity right now."
        meta={<>Canonical state · refreshed {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>}
      />

      <CapitalPosition balances={balances} loadError={balanceError} title="Capital at a glance" />

      <Section title="Attention">
        <div className="border-y border-border-hairline">
          {attention.length === 0 ? (
            <div className="py-5">
              <p className="text-sm font-medium text-text-primary">You&apos;re all caught up.</p>
              <p className="mt-1 text-sm text-text-muted">Nothing currently exposed by the governed product state requires your review.</p>
            </div>
          ) : (
            attention.map((item) => (
              <Link key={item.title} href={item.href} className="group flex min-h-14 items-center justify-between gap-5 border-b border-border-hairline py-4 last:border-0">
                <span className="text-sm font-medium text-text-primary">{item.title}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent-primary">
                  {item.label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))
          )}
        </div>
      </Section>

      <Section
        title="Capital position"
        action={<Link href="/dashboard/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">View portfolio <ArrowRight className="size-4" aria-hidden="true" /></Link>}
      >
        <div className="border-y border-border-hairline">
          {balanceError || capabilitiesResult.status === 'rejected' ? (
            <div className="py-5">
              <p className="text-sm font-medium text-text-primary">Capital position unavailable</p>
              <p className="mt-1 text-sm text-text-muted">Canonical balances or the governed asset set could not be loaded.</p>
            </div>
          ) : capabilities.length === 0 ? (
            <div className="py-5">
              <p className="text-sm font-medium text-text-primary">No governed assets exposed</p>
              <p className="mt-1 text-sm text-text-muted">The API has not exposed a customer asset set for this environment.</p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(8rem,1fr)_minmax(9rem,auto)_minmax(8rem,auto)] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted sm:grid">
                <span>Asset</span><span>Balance</span><span>State</span>
              </div>
              {capabilities.map((capability) => {
                const balance = balances.find((item) =>
                  item.asset === capability.asset &&
                  (capability.network === 'ACH' || normalizedNetwork(item.network) === normalizedNetwork(capability.network)),
                );
                return (
                  <div key={capability.code} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[minmax(8rem,1fr)_minmax(9rem,auto)_minmax(8rem,auto)] sm:items-center sm:gap-5">
                    <div><p className="text-sm font-medium text-text-primary">{capability.asset}</p><p className="mt-1 text-xs text-text-muted">{capability.network}</p></div>
                    <div className="text-sm font-medium"><FinancialValue valueAtomic={balance?.total_atomic ?? '0'} asset={capability.asset} /></div>
                    <span className="text-xs text-text-muted">{balanceState(balance)}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </Section>

      <div className="grid gap-x-10 gap-y-2 lg:grid-cols-2">
        <Section title="Capital structure">
          <Link href="/dashboard/wallet" className="group block border-b border-border-hairline py-5">
            <p className="text-sm font-medium text-text-primary">Available · Reserved · Pending · Restricted</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-sm text-text-muted">Open the canonical ledger view and governed capital workflows.</p>
              <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        </Section>
        <Section title="Allocation">
          <Link href="/dashboard/allocations" className="group block border-b border-border-hairline py-5">
            <p className="text-sm font-medium text-text-primary">Policy, drift, and authorization</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-sm text-text-muted">{overview?.allocation.state === 'VALUE' ? 'Allocation state is available for review.' : 'Build or review governed allocation policy.'}</p>
              <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
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
