import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';
import { AssetIdentity, Button, Group, Money, Row, Section, Stack, Surface } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';

const assets = [
  ['USDC', 'USD Coin · Base'],
  ['ETH', 'Ethereum · Base'],
  ['BTC', 'Bitcoin'],
] as const;

export default async function PortfolioPage() {
  await requireProvisionedUser();
  return (
    <Stack>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1>Portfolio</h1>
          <p className="mt-1 text-sm text-text-muted">
            Your capital position and asset allocation.
          </p>
        </div>
      </header>
      <section className="space-y-4 border-b border-border-hairline pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
          Portfolio value
        </p>
        <Money
          state="unavailable"
          className="block text-[2.5rem] font-medium leading-none text-text-primary"
        />
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/deposit" size="sm">
            <ArrowDownToLine className="size-4" />
            Fund account
          </Button>
          <Button href="/dashboard/allocations" variant="secondary" size="sm">
            Allocate
          </Button>
        </div>
      </section>
      <Section title="Performance">
        <div
          className="flex gap-5 overflow-x-auto border-b border-border-hairline pb-3 text-xs text-text-muted"
          aria-label="Performance periods"
        >
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
            <span key={period}>{period}</span>
          ))}
        </div>
        <p className="py-5 text-sm text-text-muted">
          Performance will appear when reporting-value history is available.
        </p>
      </Section>
      <Section title="Assets">
        <Surface className="px-4 sm:px-5">
          <Group>
            {assets.map(([asset, description]) => (
              <Row key={asset}>
                <AssetIdentity
                  asset={asset}
                  network={description.includes('Base') ? 'Base' : 'Bitcoin'}
                  detailed
                />
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums">—</p>
                  <p className="text-xs text-text-muted">No balance</p>
                </div>
              </Row>
            ))}
          </Group>
        </Surface>
        <div className="py-4 text-center">
          <p className="text-sm font-medium">No assets yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Fund your Capital Account to begin building your Neptlium portfolio.
          </p>
          <Link
            href="/dashboard/deposit"
            className="mt-3 inline-block text-sm font-medium text-accent-primary"
          >
            Fund account
          </Link>
        </div>
      </Section>
    </Stack>
  );
}
