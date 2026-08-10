import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetAmount, AssetIdentity, Group, Money, Row, Section, Stack, Surface } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';

const assets = [
  ['USDC', 'Base'],
  ['ETH', 'Base'],
  ['BTC', 'Bitcoin'],
] as const;

export default async function PortfolioPage() {
  await requireProvisionedUser();

  return (
    <Stack>
      <header>
        <h1>Portfolio</h1>
        <p className="mt-1 text-sm text-text-muted">Capital exposure, positions, and portfolio structure.</p>
      </header>

      <section className="border-y border-border-hairline py-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Portfolio value</p>
        <Money state="unavailable" className="mt-2 block text-[2.5rem] font-medium leading-none text-text-primary sm:text-[2.75rem]" />
        <p className="mt-3 max-w-xl text-sm text-text-muted">
          A canonical portfolio value will appear when supported holdings and reporting-value history are available.
        </p>
      </section>

      <Section title="Exposure">
        <Surface className="px-4 sm:px-5">
          <Group>
            {assets.map(([asset, network]) => (
              <Row key={asset}>
                <AssetIdentity asset={asset} network={network} detailed />
                <div className="text-right">
                  <AssetAmount asset={asset} state="unavailable" className="text-sm font-medium" />
                  <p className="mt-1 text-xs text-text-muted">No canonical holding</p>
                </div>
              </Row>
            ))}
          </Group>
        </Surface>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Performance">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">Performance unavailable</p>
            <p className="mt-1 text-sm text-text-muted">Performance will appear when canonical reporting-value history exists.</p>
          </Surface>
        </Section>

        <Section title="Next step">
          <Surface className="px-5 py-7">
            <p className="text-sm font-medium">No assets yet</p>
            <p className="mt-1 text-sm text-text-muted">Review Capital Account availability before funding or allocation decisions.</p>
            <Link href="/dashboard/wallet" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">
              Review Capital Account <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>
      </div>
    </Stack>
  );
}
