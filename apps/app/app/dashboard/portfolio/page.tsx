import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetIdentity, Group, Row, Section, Stack, Surface } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getPortfolioState, type ResourceState } from '@/lib/api/client';

const assets = [
  ['USDC', 'Base'],
  ['ETH', 'Base'],
  ['BTC', 'Bitcoin'],
] as const;

function stateText(state: ResourceState | undefined): string {
  if (!state || state.state === 'UNAVAILABLE') return 'Unavailable';
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No positions yet';
  return 'Available';
}

export default async function PortfolioPage() {
  await requireProvisionedUser();
  let portfolio;
  try {
    portfolio = await getPortfolioState();
  } catch {
    portfolio = null;
  }

  return (
    <Stack>
      <header>
        <h1>Portfolio</h1>
        <p className="mt-1 text-sm text-text-muted">Capital exposure, positions, and portfolio structure.</p>
      </header>

      <section className="border-y border-border-hairline py-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Portfolio value</p>
        <span className="mt-2 block text-[2.5rem] font-medium leading-none text-text-primary sm:text-[2.75rem]">{stateText(portfolio?.value)}</span>
        <p className="mt-3 max-w-xl text-sm text-text-muted">
          Canonical portfolio value is supplied by the Neptlium API only when supported holdings and reporting-value history can establish it.
        </p>
      </section>

      <Section title="Exposure">
        <Surface className="px-4 sm:px-5">
          {portfolio === null ? (
            <p className="py-7 text-sm text-text-muted">Portfolio state could not be loaded. Try again later.</p>
          ) : portfolio.positions.state === 'EMPTY' ? (
            <div className="py-7"><p className="text-sm font-medium">No positions yet.</p></div>
          ) : portfolio.positions.state === 'VALUE' ? (
            <p className="py-7 text-sm text-text-muted">Portfolio positions are available but this client does not recognize the response shape.</p>
          ) : (
            <Group>
              {assets.map(([asset, network]) => (
                <Row key={asset}>
                  <AssetIdentity asset={asset} network={network} detailed />
                  <div className="text-right">
                    <span className="text-sm font-medium">Unavailable</span>
                    <p className="mt-1 text-xs text-text-muted">No canonical holding returned by the API</p>
                  </div>
                </Row>
              ))}
            </Group>
          )}
        </Surface>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Performance">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">{stateText(portfolio?.performance)}</p>
            <p className="mt-1 text-sm text-text-muted">Performance appears only when canonical reporting-value history exists.</p>
          </Surface>
        </Section>

        <Section title="Next step">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">Review Capital Account</p>
            <p className="mt-1 text-sm text-text-muted">Capital availability and provider observation remain separate from portfolio holdings.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">
              Review Capital Account <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>
      </div>
    </Stack>
  );
}
