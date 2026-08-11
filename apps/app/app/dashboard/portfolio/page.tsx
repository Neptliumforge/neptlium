import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getPortfolioState } from '@/lib/api/client';
import { getCanonicalBalances, getFundingCapabilities } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge } from '@/components/product/ProductState';

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

  return (
    <Stack>
      <header>
        <h1>Portfolio</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Canonical asset exposure across the governed assets currently exposed by the Neptlium API.
        </p>
      </header>

      <section className="border-y border-border-hairline py-6 sm:py-7">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Portfolio state</p>
        <p className="mt-2 text-[2.25rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.6rem]">
          {loadError ? 'Unavailable' : balances.length ? `${balances.length} canonical position${balances.length === 1 ? '' : 's'}` : 'No portfolio positions yet'}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
          Neptlium keeps assets separate by denomination and network. No cross-asset total or performance value is fabricated without a canonical valuation source.
        </p>
      </section>

      <Section title="Positions">
        <div className="border-y border-border-hairline">
          {loadError ? (
            <div className="py-6">
              <p className="text-sm font-medium text-text-primary">Portfolio state is unavailable</p>
              <p className="mt-1 text-sm text-text-muted">Canonical balances or governed asset capability could not be loaded.</p>
            </div>
          ) : capabilities.length === 0 ? (
            <div className="py-6">
              <p className="text-sm font-medium text-text-primary">No governed assets are exposed</p>
              <p className="mt-1 text-sm text-text-muted">The API has not exposed a customer asset set for this environment.</p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(7rem,auto))_auto] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted md:grid">
                <span>Asset</span><span>Available</span><span>Pending</span><span>Reserved</span><span>Capability</span>
              </div>
              {capabilities.map((capability) => {
                const balance = balances.find((item) =>
                  item.asset === capability.asset &&
                  (capability.network === 'ACH' || normalizedNetwork(item.network) === normalizedNetwork(capability.network)),
                );
                return (
                  <div key={capability.code} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 md:grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(7rem,auto))_auto] md:items-center md:gap-5">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{capability.asset}</p>
                      <p className="mt-1 text-xs text-text-muted">{capability.network}</p>
                    </div>
                    <dl className="grid grid-cols-3 gap-4 md:contents">
                      <div><dt className="text-[11px] text-text-muted md:hidden">Available</dt><dd className="mt-1 text-sm font-medium md:mt-0">{balance ? <FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /> : 'No position'}</dd></div>
                      <div><dt className="text-[11px] text-text-muted md:hidden">Pending</dt><dd className="mt-1 text-sm font-medium md:mt-0">{balance ? <FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /> : 'No position'}</dd></div>
                      <div><dt className="text-[11px] text-text-muted md:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium md:mt-0">{balance ? <FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /> : 'No position'}</dd></div>
                    </dl>
                    <ProductStateBadge state={capability.state === 'ENABLED' ? 'READY' : capability.state === 'INELIGIBLE' ? 'INELIGIBLE' : capability.state === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'UNAVAILABLE'}>
                      {capability.state.replaceAll('_', ' ').toLowerCase()}
                    </ProductStateBadge>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </Section>

      <Section title="Reporting">
        <div className="border-b border-border-hairline py-5">
          <p className="text-sm font-medium text-text-primary">
            {portfolio?.performance.state === 'VALUE' ? 'Canonical reporting history available' : 'Performance unavailable'}
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
            Performance appears only when the API can establish canonical positions and reporting-value history. This page does not infer market value from provider balances.
          </p>
        </div>
      </Section>

      <Link href="/dashboard/wallet" className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent-primary">
        Review Capital Account <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Stack>
  );
}
