import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';
import { getOverviewState, type ResourceState } from '@/lib/api/client';
import {
  getCanonicalBalances,
  getFundingActivity,
  getFundingCapabilities,
  getTransferActivity,
  getTransferCapabilities,
  type FundingActivity,
  type TransferActivity,
} from '@/lib/api/financial';
import { ProductStateBadge, ProductStateMessage, type ProductStateName } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

type GovernedState = {
  readonly label: string;
  readonly detail: string;
  readonly state: ProductStateName;
};

type CapitalContext = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly createdAt: string;
};

function resourceState(resource: ResourceState | undefined, unavailable: boolean): GovernedState {
  if (unavailable || !resource) {
    return { label: 'Unavailable', detail: 'Governed state could not be loaded.', state: 'UNAVAILABLE' };
  }
  if (resource.state === 'VALUE') {
    return { label: 'Observed', detail: 'Current governed information is available.', state: 'AVAILABLE' };
  }
  if (resource.state === 'EMPTY') {
    return { label: 'Not observed', detail: 'No governed information is currently recorded.', state: 'NO_POSITION' };
  }
  if (resource.state === 'PENDING') {
    return { label: 'Pending', detail: resource.reason, state: 'PENDING' };
  }
  if (resource.state === 'NOT_CONFIGURED') {
    return { label: 'Not configured', detail: resource.reason, state: 'NOT_CONFIGURED' };
  }
  return { label: 'Unavailable', detail: resource.reason, state: 'UNAVAILABLE' };
}

function allocationState(resource: ResourceState | undefined, unavailable: boolean): GovernedState {
  const current = resourceState(resource, unavailable);
  if (current.label === 'Observed') {
    return { ...current, label: 'Configured', detail: 'A governed allocation structure is recorded.' };
  }
  if (current.label === 'Not observed') {
    return { ...current, label: 'Not configured', detail: 'No governed allocation structure is recorded.', state: 'NOT_CONFIGURED' };
  }
  return current;
}

function capitalContext(
  funding: readonly FundingActivity[],
  transfers: readonly TransferActivity[],
): readonly CapitalContext[] {
  return [
    ...funding.map((item) => ({
      id: `funding:${item.id}`,
      title: 'Funding instruction recorded',
      detail: `${item.asset} · ${item.network ?? item.rail} · ${item.state.replaceAll('_', ' ').toLowerCase()}`,
      createdAt: item.created_at,
    })),
    ...transfers.map((item) => ({
      id: `treasury:${item.id}`,
      title: 'Treasury instruction recorded',
      detail: `${item.asset} · ${item.network ?? item.rail} · ${item.state.replaceAll('_', ' ').toLowerCase()}`,
      createdAt: item.created_at,
    })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
}

export default async function DashboardPage() {
  await requireProvisionedUser();

  const [overviewResult, balancesResult, fundingCapabilitiesResult, transferCapabilitiesResult, fundingResult, transferResult] = await Promise.allSettled([
    getOverviewState(),
    getCanonicalBalances(),
    getFundingCapabilities(),
    getTransferCapabilities(),
    getFundingActivity(),
    getTransferActivity(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const balances = balancesResult.status === 'fulfilled' ? balancesResult.value.balances : [];
  const fundingCapabilities = fundingCapabilitiesResult.status === 'fulfilled' ? fundingCapabilitiesResult.value.capabilities : [];
  const transferCapabilities = transferCapabilitiesResult.status === 'fulfilled' ? transferCapabilitiesResult.value.capabilities : [];
  const funding = fundingResult.status === 'fulfilled' ? fundingResult.value.data : [];
  const transfers = transferResult.status === 'fulfilled' ? transferResult.value.data : [];
  const pendingApprovals = transfers.filter((item) => item.state === 'PENDING_APPROVAL');

  const attention = [
    ...(overviewResult.status === 'rejected' ? [{ title: 'Operating context is unavailable', detail: 'Current portfolio and allocation state could not be loaded.', href: '/dashboard', label: 'Review Overview' }] : []),
    ...(balancesResult.status === 'rejected' ? [{ title: 'Capital Account state is unavailable', detail: 'Canonical liquidity information could not be loaded.', href: '/dashboard/wallet', label: 'Open Capital Account' }] : []),
    ...(fundingCapabilitiesResult.status === 'rejected' || transferCapabilitiesResult.status === 'rejected' ? [{ title: 'Capability state is unavailable', detail: 'Current funding or treasury capability could not be confirmed.', href: '/dashboard/treasury', label: 'Open Treasury' }] : []),
    ...(pendingApprovals.length > 0 ? [{ title: `${pendingApprovals.length} item${pendingApprovals.length === 1 ? '' : 's'} require review`, detail: 'Treasury instructions are awaiting authorization.', href: '/dashboard/treasury', label: 'Open Treasury' }] : []),
  ];

  const hasPendingLiquidity = [...funding, ...transfers].some((item) => !['AVAILABLE', 'RECONCILED', 'SETTLED', 'FAILED', 'RETURNED', 'REVERSED', 'CANCELLED', 'CANCELED'].includes(item.state));
  const liquidity: GovernedState = balancesResult.status === 'rejected'
    ? { label: 'Unavailable', detail: 'Canonical liquidity state could not be loaded.', state: 'UNAVAILABLE' }
    : hasPendingLiquidity
      ? { label: 'Pending', detail: 'A governed capital instruction has not reached a settled state.', state: 'PENDING' }
      : balances.length > 0
        ? { label: 'Available', detail: 'Canonical liquidity positions are recorded by asset.', state: 'AVAILABLE' }
        : { label: 'Unavailable', detail: 'No canonical liquidity position is currently observed.', state: 'UNAVAILABLE' };

  const treasury: GovernedState = transferCapabilitiesResult.status === 'rejected'
    ? { label: 'Unavailable', detail: 'Treasury capability could not be confirmed.', state: 'UNAVAILABLE' }
    : pendingApprovals.length > 0
      ? { label: 'Review required', detail: 'A governed treasury instruction awaits authorization.', state: 'REQUIRES_APPROVAL' }
      : transferCapabilities.some((item) => item.state === 'ENABLED')
        ? { label: 'Available', detail: 'At least one governed movement capability is enabled.', state: 'AVAILABLE' }
        : { label: 'Not configured', detail: 'No governed movement capability is currently enabled.', state: 'NOT_CONFIGURED' };

  const capitalStates = [
    { name: 'Portfolio', ...resourceState(overview?.portfolio, overviewResult.status === 'rejected') },
    { name: 'Liquidity', ...liquidity },
    { name: 'Allocation', ...allocationState(overview?.allocation, overviewResult.status === 'rejected') },
    { name: 'Treasury', ...treasury },
  ] as const;

  const workspaces = [
    { title: 'Portfolio Intelligence', description: 'Understand positions and exposure.', href: '/dashboard/portfolio', context: capitalStates[0].label },
    { title: 'Capital Account', description: 'Understand funding and availability.', href: '/dashboard/wallet', context: fundingCapabilitiesResult.status === 'rejected' ? 'Unavailable' : fundingCapabilities.some((item) => item.state === 'ENABLED') ? 'Capability available' : 'Not configured' },
    { title: 'Allocation', description: 'Understand policy and structure.', href: '/dashboard/allocations', context: capitalStates[2].label },
    { title: 'Treasury', description: 'Understand movement capability and controls.', href: '/dashboard/treasury', context: capitalStates[3].label },
  ] as const;

  const recentContext = capitalContext(funding, transfers);
  const contextUnavailable = fundingResult.status === 'rejected' && transferResult.status === 'rejected';

  return (
    <div className="space-y-10 lg:space-y-12">
      <WorkspaceHeader
        eyebrow="Overview"
        title="Capital Operating Environment"
        description="Understand current capital state, changes, and attention areas."
      />

      <section aria-labelledby="attention-title">
        <div className="mb-4">
          <p className="neptlium-meta">Attention state</p>
          <h2 id="attention-title" className="mt-2 text-text-primary">
            {attention.length === 0 ? 'No items require your attention.' : `${attention.length} item${attention.length === 1 ? '' : 's'} require review.`}
          </h2>
        </div>
        <div className="border-y border-border-hairline">
          {attention.length === 0 ? (
            <div className="flex items-center justify-between gap-6 py-5">
              <p className="max-w-2xl text-sm leading-6 text-text-muted">There are no governed approvals or unavailable operating states requiring review.</p>
              <ProductStateBadge state="READY">Clear</ProductStateBadge>
            </div>
          ) : attention.map((item) => (
            <Link key={item.title} href={item.href} className="group grid gap-3 border-b border-border-hairline py-4.5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
              <div><p className="text-sm font-medium text-text-primary">{item.title}</p><p className="mt-1 max-w-2xl text-sm text-text-muted">{item.detail}</p></div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-secondary group-hover:text-text-primary">{item.label}<ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="capital-state-title">
        <div className="mb-4"><p className="neptlium-meta">Governed state</p><h2 id="capital-state-title" className="mt-2 text-text-primary">Capital state</h2></div>
        <div className="grid border-y border-border-hairline sm:grid-cols-2 lg:grid-cols-4">
          {capitalStates.map((item) => (
            <div key={item.name} className="border-b border-border-hairline py-5 sm:px-5 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <p className="text-sm font-medium text-text-primary">{item.name}</p>
              <div className="mt-3"><ProductStateBadge state={item.state}>{item.label}</ProductStateBadge></div>
              <p className="mt-3 text-xs leading-5 text-text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspaces-title">
        <div className="mb-4"><p className="neptlium-meta">Navigate</p><h2 id="workspaces-title" className="mt-2 text-text-primary">Operating workspaces</h2></div>
        <nav aria-label="Operating workspaces" className="grid border-t border-border-hairline md:grid-cols-2">
          {workspaces.map((workspace) => (
            <Link key={workspace.href} href={workspace.href} className="group flex min-h-32 items-start justify-between gap-6 border-b border-border-hairline py-5 md:odd:border-r md:odd:pr-6 md:even:pl-6">
              <div><p className="text-sm font-medium text-text-primary">{workspace.title}</p><p className="mt-2 text-sm leading-6 text-text-muted">{workspace.description}</p><p className="mt-3 text-xs text-text-secondary">Current context · {workspace.context}</p></div>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="recent-context-title">
        <div className="mb-4"><p className="neptlium-meta">Recent</p><h2 id="recent-context-title" className="mt-2 text-text-primary">Capital context</h2></div>
        <div className="border-y border-border-hairline">
          {contextUnavailable ? (
            <ProductStateMessage state="UNAVAILABLE" title="Capital context unavailable">Recent governed context could not be loaded. No activity or value is inferred.</ProductStateMessage>
          ) : recentContext.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No recent capital context">No governed funding or treasury instructions are currently recorded.</ProductStateMessage>
          ) : recentContext.map((item) => (
            <div key={item.id} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
              <div><p className="text-sm font-medium text-text-primary">{item.title}</p><p className="mt-1 text-xs text-text-muted">{item.detail}</p></div>
              <time dateTime={item.createdAt} className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleString()}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
