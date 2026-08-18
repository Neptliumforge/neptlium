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
  type FundingCapability,
  type TransferActivity,
} from '@/lib/api/financial';
import { CapitalPosition } from '@/components/product/CapitalPosition';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

function activityState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(state)) return 'ERROR' as const;
  if (['CANCELLED', 'CANCELED'].includes(state)) return 'UNAVAILABLE' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

function normalizedNetwork(value: string | null | undefined) {
  return (value ?? '').replaceAll('-', '_').toUpperCase();
}

function fundingLabel(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'Enabled';
  if (state === 'INELIGIBLE') return 'Ineligible';
  if (state === 'NOT_CONFIGURED') return 'Not configured';
  return 'Disabled';
}

function capitalEmptyAction(capabilities: readonly FundingCapability[], capabilityError: boolean) {
  if (capabilityError) {
    return {
      href: '/dashboard/wallet',
      label: 'View Capital Account',
      detail: 'Funding status could not be confirmed from the governed capability API. Overview will not enable a funding action while that state is unknown.',
    };
  }

  const enabled = capabilities.filter((capability) => capability.state === 'ENABLED');
  if (enabled.length > 0) {
    const rails = enabled.map((capability) => `${capability.asset} · ${capability.network}`).join(', ');
    return {
      href: '/dashboard/wallet#deposit',
      label: 'Fund capital',
      detail: `${rails} ${enabled.length === 1 ? 'is' : 'are'} exposed as enabled for funding. Funding does not become canonical capital until required posting and reconciliation complete.`,
    };
  }

  if (capabilities.length === 0) {
    return {
      href: '/dashboard/wallet',
      label: 'View Capital Account',
      detail: 'No governed customer funding capability is currently exposed by the backend.',
    };
  }

  return {
    href: '/dashboard/wallet#deposit',
    label: 'Review funding status',
    detail: 'Funding rails are exposed but none is currently enabled. Capital Account shows the authoritative capability state.',
  };
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
  const capabilityError = capabilitiesResult.status === 'rejected';
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
  const enabledFunding = capabilities.filter((item) => item.state === 'ENABLED');
  const attention = [
    ...(balanceError ? [{ title: 'Capital state could not be loaded', href: '/dashboard/wallet', label: 'Review Capital Account' }] : []),
    ...(activityError ? [{ title: 'Capital activity could not be loaded', href: '/dashboard/transactions', label: 'Review activity' }] : []),
    ...(pendingApprovals.length
      ? [{ title: `${pendingApprovals.length} transfer${pendingApprovals.length === 1 ? '' : 's'} awaiting approval`, href: '/dashboard/treasury', label: 'Review Treasury' }]
      : []),
  ];

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Capital operating environment"
        title="Overview"
        description="Your canonical capital position, operational attention, governed activity, and next available actions in one place."
        meta={<>Canonical state · refreshed {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>}
        action={(
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/wallet#deposit" className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Deposit</Link>
            <Link href="/dashboard/wallet#withdraw" className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">Withdraw</Link>
            <Link href="/dashboard/allocations" className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">Allocate</Link>
          </div>
        )}
      />

      <CapitalPosition balances={balances} loadError={balanceError} title="Capital at a glance" emptyAction={capitalEmptyAction(capabilities, capabilityError)} />

      <Section title="Attention">
        <div className="border-y border-border-hairline">
          {attention.length === 0 ? (
            <div className="py-5"><p className="text-sm font-medium text-text-primary">You&apos;re all caught up.</p><p className="mt-1 text-sm text-text-muted">Nothing currently exposed by the governed product state requires your review.</p></div>
          ) : attention.map((item) => (
            <Link key={item.title} href={item.href} className="group flex min-h-14 items-center justify-between gap-5 border-b border-border-hairline py-4 last:border-0">
              <span className="text-sm font-medium text-text-primary">{item.title}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent-primary">{item.label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Canonical positions" action={<Link href="/dashboard/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">View portfolio <ArrowRight className="size-4" aria-hidden="true" /></Link>}>
        <div className="border-y border-border-hairline">
          {balanceError ? (
            <ProductStateMessage state="ERROR" title="Capital positions unavailable">Canonical balances could not be loaded. No position value is inferred.</ProductStateMessage>
          ) : balances.length === 0 ? (
            <ProductStateMessage state="NO_POSITION" title="0 canonical positions">The canonical balance collection is successfully empty. Funding readiness is shown separately.</ProductStateMessage>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(8rem,1fr)_minmax(9rem,auto)_minmax(8rem,auto)] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted sm:grid"><span>Asset</span><span>Canonical total</span><span>Funding</span></div>
              {balances.map((balance) => {
                const capability = capabilities.find((item) => item.asset === balance.asset && (item.network === 'ACH' || normalizedNetwork(balance.network) === normalizedNetwork(item.network)));
                return (
                  <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[minmax(8rem,1fr)_minmax(9rem,auto)_minmax(8rem,auto)] sm:items-center sm:gap-5">
                    <div><p className="text-sm font-medium text-text-primary">{balance.asset}</p><p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'}</p></div>
                    <div><p className="text-[11px] text-text-muted sm:hidden">Canonical total</p><div className="mt-1 text-sm font-medium sm:mt-0"><FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} /></div></div>
                    <div><p className="text-[11px] text-text-muted sm:hidden">Funding</p><p className="mt-1 text-sm font-medium text-text-primary sm:mt-0">{capability ? fundingLabel(capability.state) : 'Not exposed'}</p></div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {!balanceError && balances.length === 0 ? <p className="mt-3 text-xs text-text-muted">{capabilityError ? 'Funding capability is unavailable.' : enabledFunding.length ? `${enabledFunding.length} funding rail${enabledFunding.length === 1 ? '' : 's'} can be reviewed in Capital Account.` : 'No funding rail is currently enabled.'}</p> : null}
      </Section>

      <Section title="Operating readiness">
        <div className="grid gap-x-10 gap-y-5 border-y border-border-hairline py-5 sm:grid-cols-3">
          <div><p className="text-xs text-text-muted">Funding</p><p className="mt-1 text-sm font-medium text-text-primary">{capabilityError ? 'Unavailable' : enabledFunding.length ? `${enabledFunding.length} enabled rail${enabledFunding.length === 1 ? '' : 's'}` : 'No enabled rail'}</p><Link href="/dashboard/wallet#deposit" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-primary">Review funding <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
          <div><p className="text-xs text-text-muted">Treasury</p><p className="mt-1 text-sm font-medium text-text-primary">{pendingApprovals.length ? `${pendingApprovals.length} awaiting approval` : 'No approval attention'}</p><Link href="/dashboard/treasury" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-primary">Open Treasury <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
          <div><p className="text-xs text-text-muted">Allocation</p><p className="mt-1 text-sm font-medium text-text-primary">{overview?.allocation.state === 'VALUE' ? 'State available' : 'Policy review available'}</p><Link href="/dashboard/allocations" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-primary">Review policy <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
        </div>
      </Section>

      <Section title="Recent activity" action={<Link href="/dashboard/transactions" className="text-sm font-medium text-accent-primary">See all</Link>}>
        <div className="border-y border-border-hairline">
          {activityError ? (
            <ProductStateMessage state="ERROR" title="Activity unavailable">The Neptlium API could not load canonical activity.</ProductStateMessage>
          ) : recent.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No capital activity yet">Funding and governed movement will appear here when canonical intents exist.</ProductStateMessage>
          ) : recent.map((item) => (
            <div key={`${item.kind}:${item.id}`} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5">
              <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{item.kind} · {item.asset}</p><p className="mt-1 truncate text-xs text-text-muted">{item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}</p></div>
              <div className="text-sm font-medium">{'amount_atomic' in item && item.amount_atomic ? <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} /> : <span className="text-text-muted">Amount unavailable</span>}</div>
              <ProductStateBadge state={activityState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge>
            </div>
          ))}
        </div>
      </Section>
    </Stack>
  );
}
