import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';

function activityState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(state)) return 'ERROR' as const;
  if (['CANCELLED', 'CANCELED'].includes(state)) return 'UNAVAILABLE' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

function fundingLabel(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'Enabled';
  if (state === 'INELIGIBLE') return 'Ineligible';
  if (state === 'NOT_CONFIGURED') return 'Not configured';
  return 'Disabled';
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
  ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 4);

  const pendingApprovals = transfers.filter((item) => item.state === 'PENDING_APPROVAL');
  const enabledFunding = capabilities.filter((item) => item.state === 'ENABLED');
  const attention = [
    ...(balanceError ? [{ title: 'Capital state could not be loaded', detail: 'Review the canonical Capital Account before taking consequential action.', href: '/dashboard/wallet', label: 'Review capital' }] : []),
    ...(activityError ? [{ title: 'Capital activity could not be loaded', detail: 'Recent governed movement is temporarily unavailable.', href: '/dashboard/transactions', label: 'Review activity' }] : []),
    ...(pendingApprovals.length ? [{ title: `${pendingApprovals.length} transfer${pendingApprovals.length === 1 ? '' : 's'} awaiting authorization`, detail: 'Treasury movement is held until the required approval state is satisfied.', href: '/dashboard/treasury', label: 'Open Treasury' }] : []),
  ];

  return (
    <div className="space-y-12 lg:space-y-16">
      <header className="flex flex-col gap-7 border-b border-border-hairline pb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
        <div className="max-w-2xl">
          <p className="neptlium-meta">Capital operating environment</p>
          <h1 className="mt-3 text-text-primary">Overview</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
            Canonical capital state, operational attention, and governed activity — resolved into one operating context.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="size-1.5 rounded-full bg-[#0f8f86]" aria-hidden="true" />
          <span>Canonical state · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      <section aria-labelledby="capital-position-title">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="neptlium-meta">Capital state</p>
            <h2 id="capital-position-title" className="mt-2 text-text-primary">Capital position</h2>
          </div>
          <Link href="/dashboard/wallet" className="hidden items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary sm:inline-flex">
            Open Capital Account <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="neptlium-plane overflow-hidden rounded-[2px]">
          <div className="px-5 py-7 sm:px-7 sm:py-9 lg:px-9 lg:py-10">
            {balanceError ? (
              <ProductStateMessage state="ERROR" title="Capital position unavailable">Canonical balances could not be loaded. No position value is inferred.</ProductStateMessage>
            ) : balances.length === 0 ? (
              <div className="max-w-xl py-3">
                <p className="text-[clamp(2.3rem,5vw,4.4rem)] font-medium leading-none tracking-[-0.06em] text-text-primary">No position</p>
                <p className="mt-5 text-sm leading-6 text-text-secondary">No canonical capital position exists yet. Funding readiness remains governed independently.</p>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)] lg:items-end">
                <div>
                  <p className="text-xs font-medium text-text-muted">Canonical positions</p>
                  <div className="mt-5 space-y-5">
                    {balances.slice(0, 3).map((balance, index) => (
                      <div key={`${balance.asset}:${balance.network ?? ''}`} className={index === 0 ? '' : 'border-t border-border-hairline pt-5'}>
                        <div className="flex items-baseline justify-between gap-6">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{balance.asset}</p>
                            <p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Canonical denomination'}</p>
                          </div>
                          <div className="text-right text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium leading-none tracking-[-0.055em] text-text-primary" data-numeric>
                            <FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border-hairline pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <p className="neptlium-meta">Operating readiness</p>
                  <dl className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-6"><dt className="text-sm text-text-muted">Funding</dt><dd className="text-sm font-medium text-text-primary">{capabilityError ? 'Unavailable' : enabledFunding.length ? `${enabledFunding.length} enabled` : 'Not enabled'}</dd></div>
                    <div className="flex items-center justify-between gap-6"><dt className="text-sm text-text-muted">Treasury</dt><dd className="text-sm font-medium text-text-primary">{pendingApprovals.length ? `${pendingApprovals.length} to authorize` : 'No attention'}</dd></div>
                    <div className="flex items-center justify-between gap-6"><dt className="text-sm text-text-muted">Allocation</dt><dd className="text-sm font-medium text-text-primary">{overview?.allocation.state === 'VALUE' ? 'Available' : 'Review available'}</dd></div>
                  </dl>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border-hairline bg-black/[.018] px-5 py-4 sm:px-7 lg:px-9">
            <Link href="/dashboard/wallet#deposit" className="inline-flex min-h-10 items-center bg-[#111312] px-4 text-sm font-medium text-[#f4f0e8] hover:bg-[#242724]">Fund capital</Link>
            <Link href="/dashboard/treasury" className="inline-flex min-h-10 items-center px-3 text-sm font-medium text-text-secondary hover:text-text-primary">Review movement <ArrowRight className="ml-1.5 size-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="attention-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="neptlium-meta">Governed work</p><h2 id="attention-title" className="mt-2 text-text-primary">Attention</h2></div>
        </div>
        <div className="border-y border-border-hairline">
          {attention.length === 0 ? (
            <div className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div><p className="text-sm font-medium text-text-primary">No current operating attention.</p><p className="mt-1 text-sm text-text-muted">Nothing exposed by the governed product state currently requires review.</p></div>
              <span className="mt-2 text-xs font-medium text-[#0b746d] sm:mt-0">State clear</span>
            </div>
          ) : attention.map((item) => (
            <Link key={item.title} href={item.href} className="group grid gap-3 border-b border-border-hairline py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
              <div><p className="text-sm font-medium text-text-primary">{item.title}</p><p className="mt-1 max-w-2xl text-sm text-text-muted">{item.detail}</p></div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-secondary group-hover:text-text-primary">{item.label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="context-title">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div><p className="neptlium-meta">Operating context</p><h2 id="context-title" className="mt-2 text-text-primary">Capital context</h2></div>
          <Link href="/dashboard/transactions" className="text-sm font-medium text-text-secondary hover:text-text-primary">View all activity</Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)] lg:gap-12">
          <div className="border-y border-border-hairline">
            {activityError ? (
              <ProductStateMessage state="ERROR" title="Activity unavailable">The Neptlium API could not load canonical activity.</ProductStateMessage>
            ) : recent.length === 0 ? (
              <div className="py-6"><p className="text-sm font-medium text-text-primary">No capital activity yet.</p><p className="mt-1 text-sm text-text-muted">Governed movement will appear here when canonical intents exist.</p></div>
            ) : recent.map((item) => (
              <div key={`${item.kind}:${item.id}`} className="grid gap-3 border-b border-border-hairline py-5 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{item.kind} · {item.asset}</p><p className="mt-1 truncate text-xs text-text-muted">{item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}</p></div>
                <div className="text-sm font-medium text-text-primary" data-numeric>{'amount_atomic' in item && item.amount_atomic ? <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} /> : <span className="text-text-muted">—</span>}</div>
                <ProductStateBadge state={activityState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge>
              </div>
            ))}
          </div>

          <nav aria-label="Capital context" className="border-t border-border-hairline lg:border-y">
            {[
              ['Capital Account', '/dashboard/wallet', capabilityError ? 'State unavailable' : enabledFunding.length ? `${enabledFunding.length} funding rail${enabledFunding.length === 1 ? '' : 's'} enabled` : 'Review funding state'],
              ['Treasury', '/dashboard/treasury', pendingApprovals.length ? `${pendingApprovals.length} awaiting authorization` : 'No approval attention'],
              ['Allocation', '/dashboard/allocations', overview?.allocation.state === 'VALUE' ? 'Allocation state available' : 'Policy context available'],
              ['Intelligence', '/dashboard/portfolio', 'Portfolio context'],
            ].map(([label, href, detail]) => (
              <Link key={href} href={href} className="group flex items-center justify-between gap-5 border-b border-border-hairline py-4 last:border-0">
                <div><p className="text-sm font-medium text-text-primary">{label}</p><p className="mt-1 text-xs text-text-muted">{detail}</p></div>
                <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {!capabilityError && capabilities.length > 0 ? (
        <footer className="border-t border-border-hairline pt-5 text-xs text-text-muted">
          Funding capability: {capabilities.map((capability) => `${capability.asset} · ${capability.network} · ${fundingLabel(capability.state)}`).join('  /  ')}
        </footer>
      ) : null}
    </div>
  );
}
