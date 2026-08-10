import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Money, Section, Stack, Surface } from '@neptlium/ui';

export function TreasuryView() {
  return (
    <Stack className="py-1">
      <header>
        <h1>Treasury</h1>
        <p className="mt-1 text-sm text-text-muted">Liquidity, reserves, funding state, and governed capital movement.</p>
      </header>

      <section className="border-y border-border-hairline py-5">
        <dl className="grid grid-cols-3 gap-4">
          {['Available liquidity', 'Reserved', 'Committed'].map((label) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="mt-2"><Money state="unavailable" className="text-base font-medium text-text-primary sm:text-lg" /></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Liquidity position">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">Liquidity state unavailable</p>
            <p className="mt-1 text-sm text-text-muted">Treasury state will appear when canonical capital and reservation data are available.</p>
          </Surface>
        </Section>

        <Section title="Funding">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">Funding follows Capital Account capability</p>
            <p className="mt-1 text-sm text-text-muted">No live USD funding rail is represented. Supported testnet Capital Account infrastructure remains separate from canonical treasury state.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">
              Review Capital Account <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>
      </div>

      <Section title="Capital movement">
        <Surface className="px-5 py-7">
          <p className="text-sm font-medium">Transfers require governed execution</p>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">Authorization, capital availability, reservation, submission, settlement, and reconciliation remain distinct. No transfer is represented as executed from this surface.</p>
          <ol className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border-hairline bg-border-hairline sm:grid-cols-5" aria-label="Transfer lifecycle">
            {['Authorize', 'Reserve', 'Submit', 'Settle', 'Reconcile'].map((state, index) => (
              <li key={state} className="bg-surface-1 px-3 py-3">
                <span className="block text-[11px] text-accent-primary">0{index + 1}</span>
                <strong className="mt-2 block text-xs font-medium text-text-primary">{state}</strong>
              </li>
            ))}
          </ol>
        </Surface>
      </Section>
    </Stack>
  );
}
