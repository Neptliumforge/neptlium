import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getPortfolioState } from '@/lib/api/client';
import { getCanonicalBalances, getFundingCapabilities } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

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
  const balanceError = balancesResult.status === 'rejected';
  const capabilityError = capabilitiesResult.status === 'rejected';
  const hasEnabledFunding = capabilities.some((capability) => capability.state === 'ENABLED');
  const fundingActionLabel = capabilityError || !hasEnabledFunding ? 'Review funding' : 'Fund capital';
  const hasMultipleAssets = balances.length > 1;
  const singleBalance = balances.length === 1 ? balances[0] : undefined;

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Canonical positions"
        title="Portfolio"
        description="Inspect established capital positions, liquidity state, exposure context, and the valuation evidence available today."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/wallet#deposit" className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Deposit</Link>
            <Link href="/dashboard/wallet" className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">Capital Account</Link>
          </div>
        )}
      />

      <section className="grid gap-5 border-b border-border-hairline pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:pb-7">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Portfolio state</p>
          <div className="mt-2 text-[2.25rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.6rem]">
            {balanceError ? 'Unavailable' : balances.length === 0 ? '0 positions' : hasMultipleAssets ? `${balances.length} canonical assets` : <FinancialValue valueAtomic={singleBalance!.total_atomic} asset={singleBalance!.asset} />}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {balanceError
              ? 'Canonical portfolio state could not be established. No zero or valuation is inferred.'
              : balances.length === 0
                ? 'The canonical balance collection is successfully empty. Fund capital to establish the first position.'
                : hasMultipleAssets
                  ? 'Asset quantities are established independently. A cross-asset total remains unavailable without governed valuation evidence.'
                  : 'A single canonical denomination is established from the Neptlium ledger.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          <div><p className="text-xs text-text-muted">Performance</p><p className="mt-1 text-sm font-medium text-text-primary">Not established</p></div>
          <div><p className="text-xs text-text-muted">Valuation</p><p className="mt-1 text-sm font-medium text-text-primary">{balanceError ? 'Unavailable' : hasMultipleAssets ? 'Unavailable' : balances.length ? 'Single denomination' : 'No positions'}</p></div>
          <div className="col-span-2 sm:col-span-1"><p className="text-xs text-text-muted">Source</p><p className="mt-1 text-sm font-medium text-text-primary">Canonical ledger</p></div>
        </div>
      </section>

      <nav className="flex gap-6 overflow-x-auto border-b border-border-hairline" aria-label="Portfolio views">
        {[
          ['Positions', '#positions'],
          ['Funding coverage', '#funding-coverage'],
          ['Intelligence', '#intelligence'],
        ].map(([label, href], index) => (
          <a key={href} href={href} className={`min-h-11 shrink-0 border-b-2 px-0.5 pt-3 text-sm font-medium ${index === 0 ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="positions" className="scroll-mt-24">
        <Section title="Canonical positions">
          <div className="border-y border-border-hairline">
            {balanceError ? (
              <ProductStateMessage state="ERROR" title="Portfolio positions unavailable">Canonical balances could not be loaded from the Neptlium API.</ProductStateMessage>
            ) : balances.length === 0 ? (
              <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <ProductStateMessage state="NO_POSITION" title="No canonical positions">Zero positions is an established empty collection, not a fabricated zero balance.</ProductStateMessage>
                <Link href="/dashboard/wallet#deposit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">{fundingActionLabel}</Link>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(8rem,1fr)_repeat(5,minmax(7rem,auto))] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted lg:grid">
                  <span>Asset</span><span>Total</span><span>Available</span><span>Pending</span><span>Reserved</span><span>Restricted</span>
                </div>
                {balances.map((balance) => (
                  <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-4 border-b border-border-hairline py-5 last:border-0 lg:grid-cols-[minmax(8rem,1fr)_repeat(5,minmax(7rem,auto))] lg:items-center lg:gap-5">
                    <div><p className="text-sm font-medium text-text-primary">{balance.asset}</p><p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'} · canonical position</p></div>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:contents">
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Total</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Available</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Pending</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Restricted</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.restricted_atomic} asset={balance.asset} /></dd></div>
                    </dl>
                  </div>
                ))}
              </>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-text-muted">Positions are rendered only from returned canonical balance records. Funding capability does not create a position.</p>
        </Section>
      </section>

      <section id="funding-coverage" className="scroll-mt-24">
        <Section title="Funding coverage">
          <div className="border-y border-border-hairline">
            {capabilityError ? (
              <ProductStateMessage state="ERROR" title="Funding coverage unavailable">The governed funding capability set could not be loaded.</ProductStateMessage>
            ) : capabilities.length === 0 ? (
              <ProductStateMessage state="NOT_CONFIGURED" title="No governed funding assets exposed">No funding capability is currently exposed for this environment.</ProductStateMessage>
            ) : capabilities.map((capability) => (
              <div key={capability.code} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-5">
                <div><p className="text-sm font-medium text-text-primary">{capability.asset} · {capability.network}</p><p className="mt-1 text-xs text-text-muted">Funding capability · independent of canonical holdings</p></div>
                <ProductStateBadge state={capability.state === 'ENABLED' ? 'READY' : capability.state === 'INELIGIBLE' ? 'INELIGIBLE' : capability.state === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'UNAVAILABLE'}>{capability.state.replaceAll('_', ' ').toLowerCase()}</ProductStateBadge>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section id="intelligence" className="scroll-mt-24">
        <Section title="Portfolio intelligence">
          <div className="divide-y divide-border-hairline border-y border-border-hairline">
            {[
              ['Concentration', balanceError ? 'Unavailable while canonical positions cannot be loaded.' : hasMultipleAssets ? 'Requires governed cross-asset valuation before concentration can be calculated.' : balances.length ? 'Single-denomination capital is currently visible.' : 'No positions to analyze yet.'],
              ['Liquidity', balanceError ? 'Unavailable.' : balances.length ? 'Canonical available, pending, reserved, and restricted quantities are established by asset.' : 'No canonical liquidity positions yet.'],
              ['Volatility', 'Not established without an authoritative market-data and valuation source.'],
              ['Counterparty', 'Not established from provider identity alone; governed counterparty evidence is required.'],
              ['Allocation drift', 'Open Allocation to compare canonical positions with an authorized policy.'],
              ['Reserve coverage', 'Appears only when policy requirements and authoritative valuation inputs can establish coverage.'],
            ].map(([title, copy]) => (
              <div key={title} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <p className="text-sm font-medium text-text-primary">{title}</p>
                <p className="text-sm leading-6 text-text-muted">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/dashboard/allocations" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">Review Allocation <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/dashboard/treasury" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">Review Treasury <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </Section>
      </section>

      <Section title="Reporting">
        <div className="border-y border-border-hairline py-5">
          <p className="text-sm font-medium text-text-primary">{portfolio?.performance.state === 'VALUE' ? 'Canonical reporting history available' : 'Performance not established'}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Performance appears only when the API can establish canonical positions and reporting-value history. Provider balances and unsupported market prices are never promoted into portfolio performance.</p>
        </div>
      </Section>
    </Stack>
  );
}
