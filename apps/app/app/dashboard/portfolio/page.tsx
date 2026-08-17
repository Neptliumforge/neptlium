import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getPortfolioState } from '@/lib/api/client';
import { getCanonicalBalances, getFundingCapabilities } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

function normalizedNetwork(value: string | null | undefined) {
  return (value ?? '').replaceAll('-', '_').toUpperCase();
}

export default async function PortfolioPage() {
  await requireProvisionedUser();

  const [portfolioResult, balancesResult, capabilitiesResult] = await Promise.allSettled([
    getPortfolioState(),
    getCanonicalBalances(),
    getFundingCapabilities(),
  ]);

  const portfolio = portfolioResult.status === 'fulfilled' ? portfolioResult.value : null;
  const balances = balancesResult.status === 'fulfilled' ? balancesResult.value.balances : [];
  const capabilities = capabilitiesResult.status === 'fulfilled' ? capabilitiesResult.value.capabilities : [];
  const loadError = balancesResult.status === 'rejected' || capabilitiesResult.status === 'rejected';
  const hasMultipleAssets = balances.length > 1;

  return (
    <Stack>
      <WorkspaceHeader
        title="Portfolio"
        description="Understand what you own, where capital is exposed, and which analytical views are authoritative today."
        action={<Link href="/dashboard/wallet" className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Deposit</Link>}
      />

      <section className="border-b border-border-hairline pb-6 sm:pb-7">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Portfolio value</p>
        <p className="mt-2 text-[2.25rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.6rem]">
          {loadError ? 'Unavailable' : balances.length === 0 ? '0 positions' : hasMultipleAssets ? 'Valuation unavailable' : <FinancialValue valueAtomic={balances[0]!.total_atomic} asset={balances[0]!.asset} />}
        </p>
        <div className="mt-5 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div><p className="text-xs text-text-muted">Today</p><p className="mt-1 text-sm font-medium text-text-primary">—</p></div>
          <div><p className="text-xs text-text-muted">Total return</p><p className="mt-1 text-sm font-medium text-text-primary">—</p></div>
          <div><p className="text-xs text-text-muted">Valuation state</p><p className="mt-1 text-sm font-medium text-text-primary">{hasMultipleAssets ? 'Not available' : balances.length ? 'Single denomination' : 'No positions'}</p></div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-text-muted">
          No cross-asset total or performance value is fabricated without a canonical valuation source.
        </p>
      </section>

      <nav className="flex gap-6 overflow-x-auto border-b border-border-hairline" aria-label="Portfolio views">
        {[
          ['Holdings', '#holdings'],
          ['Allocation', '#allocation'],
          ['Exposure', '#exposure'],
        ].map(([label, href], index) => (
          <a key={href} href={href} className={`min-h-11 shrink-0 border-b-2 px-0.5 pt-3 text-sm font-medium ${index === 0 ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="holdings" className="scroll-mt-24">
        <Section title="Holdings">
          <div className="border-y border-border-hairline">
            {loadError ? (
              <div className="py-6"><p className="text-sm font-medium text-text-primary">Portfolio state is unavailable</p><p className="mt-1 text-sm text-text-muted">Canonical balances or governed asset capability could not be loaded.</p></div>
            ) : capabilities.length === 0 ? (
              <div className="py-6"><p className="text-sm font-medium text-text-primary">No governed assets are exposed</p><p className="mt-1 text-sm text-text-muted">The API has not exposed a customer asset set for this environment.</p></div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(7rem,auto))_auto] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted md:grid">
                  <span>Asset</span><span>Available</span><span>Pending</span><span>Reserved</span><span>Capability</span>
                </div>
                {capabilities.map((capability) => {
                  const balance = balances.find((item) => item.asset === capability.asset && (capability.network === 'ACH' || normalizedNetwork(item.network) === normalizedNetwork(capability.network)));
                  return (
                    <div key={capability.code} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 md:grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(7rem,auto))_auto] md:items-center md:gap-5">
                      <div><p className="text-sm font-medium text-text-primary">{capability.asset}</p><p className="mt-1 text-xs text-text-muted">{capability.network}</p></div>
                      <dl className="grid grid-cols-3 gap-4 md:contents">
                        <div><dt className="text-[11px] text-text-muted md:hidden">Available</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance?.available_atomic ?? '0'} asset={capability.asset} /></dd></div>
                        <div><dt className="text-[11px] text-text-muted md:hidden">Pending</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance?.pending_atomic ?? '0'} asset={capability.asset} /></dd></div>
                        <div><dt className="text-[11px] text-text-muted md:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance?.reserved_atomic ?? '0'} asset={capability.asset} /></dd></div>
                      </dl>
                      <ProductStateBadge state={capability.state === 'ENABLED' ? 'READY' : capability.state === 'INELIGIBLE' ? 'INELIGIBLE' : capability.state === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'UNAVAILABLE'}>{capability.state.replaceAll('_', ' ').toLowerCase()}</ProductStateBadge>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </Section>
      </section>

      <section id="allocation" className="scroll-mt-24">
        <Section title="Allocation">
          <div className="grid gap-x-10 gap-y-3 border-y border-border-hairline py-5 sm:grid-cols-3">
            <div><p className="text-xs text-text-muted">Cash & reserves</p><p className="mt-1 text-sm font-medium text-text-primary">—</p></div>
            <div><p className="text-xs text-text-muted">Digital assets</p><p className="mt-1 text-sm font-medium text-text-primary">—</p></div>
            <div><p className="text-xs text-text-muted">Other supported capital</p><p className="mt-1 text-sm font-medium text-text-primary">—</p></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-muted">Allocation percentages require a governed cross-asset valuation source. Canonical quantities remain visible above while valuation is unavailable.</p>
        </Section>
      </section>

      <section id="exposure" className="scroll-mt-24">
        <Section title="Portfolio intelligence">
          <div className="divide-y divide-border-hairline border-y border-border-hairline">
            {[
              ['Concentration', hasMultipleAssets ? 'Concentration analysis requires governed valuation across denominations.' : balances.length ? 'Single-denomination capital is currently visible.' : 'No concentration analysis available yet.'],
              ['Liquidity', balances.length ? 'Liquidity is represented by canonical available, pending, reserved, and restricted balances.' : 'No invested positions yet.'],
              ['Allocation drift', 'Open Allocation to compare canonical positions with an authorized policy.'],
              ['Reserve coverage', 'Reserve coverage appears only after a reserve policy and authoritative valuation inputs exist.'],
            ].map(([title, copy]) => (
              <div key={title} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <p className="text-sm font-medium text-text-primary">{title}</p>
                <p className="text-sm leading-6 text-text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section title="Reporting">
        <div className="border-b border-border-hairline py-5">
          <p className="text-sm font-medium text-text-primary">{portfolio?.performance.state === 'VALUE' ? 'Canonical reporting history available' : 'Performance unavailable'}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Performance appears only when the API can establish canonical positions and reporting-value history. This page does not infer market value from provider balances.</p>
        </div>
      </Section>

      <Link href="/dashboard/wallet" className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent-primary">Review Capital Account <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </Stack>
  );
}
