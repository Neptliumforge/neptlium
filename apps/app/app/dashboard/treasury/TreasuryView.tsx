import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack, Surface } from '@neptlium/ui';
import type { ResourceState, TreasuryState } from '@/lib/api/client';

function stateText(state: ResourceState | undefined): string {
  if (!state || state.state === 'UNAVAILABLE') return 'Unavailable';
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No data yet';
  return 'Available';
}

export function TreasuryView({ state }: { readonly state: TreasuryState | null }) {
  return (
    <Stack className="py-1">
      <header>
        <h1>Treasury</h1>
        <p className="mt-1 text-sm text-text-muted">Liquidity, reserves, funding state, and governed capital movement.</p>
      </header>

      <section className="border-y border-border-hairline py-5">
        {state === null ? (
          <div>
            <p className="text-sm font-medium">Treasury state is unavailable</p>
            <p className="mt-1 text-sm text-text-muted">The Neptlium API could not load Treasury state. Try again later.</p>
          </div>
        ) : (
          <dl className="grid grid-cols-3 gap-4">
            {[
              ['Available liquidity', state.available_liquidity],
              ['Reserved', state.reserved],
              ['Committed', state.committed],
            ].map(([label, resource]) => (
              <div key={label as string} className="min-w-0">
                <dt className="text-xs text-text-muted">{label as string}</dt>
                <dd className="mt-2 text-base font-medium text-text-primary sm:text-lg">{stateText(resource as ResourceState)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Liquidity position">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">{stateText(state?.available_liquidity)}</p>
            <p className="mt-1 text-sm text-text-muted">Treasury liquidity is exposed only when canonical capital and reservation state can establish it.</p>
          </Surface>
        </Section>

        <Section title="Funding">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">{stateText(state?.funding)}</p>
            <p className="mt-1 text-sm text-text-muted">Funding availability is determined by the Neptlium API. No live USD rail is implied by this surface.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">
              Review Capital Account <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>
      </div>

      <Section title="Capital movement">
        <Surface className="px-5 py-7">
          <p className="text-sm font-medium">{stateText(state?.transfers)}</p>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">Authorization, capital availability, reservation, submission, settlement, and reconciliation remain distinct. No transfer is represented as executed from this surface.</p>
          <ol className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border-hairline bg-border-hairline sm:grid-cols-5" aria-label="Transfer lifecycle">
            {['Authorize', 'Reserve', 'Submit', 'Settle', 'Reconcile'].map((stage, index) => (
              <li key={stage} className="bg-surface-1 px-3 py-3">
                <span className="block text-[11px] text-accent-primary">0{index + 1}</span>
                <strong className="mt-2 block text-xs font-medium text-text-primary">{stage}</strong>
              </li>
            ))}
          </ol>
        </Surface>
      </Section>
    </Stack>
  );
}
