import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  AssetAmount,
  AssetIdentity,
  Badge,
  Group,
  IdentityMark,
  Row,
  Section,
  Stack,
  Surface,
  identityRegistry,
} from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getOverviewState, type ResourceState } from '@/lib/api/client';

const tone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  settled: 'success',
  pending: 'warning',
  pending_review: 'warning',
  confirming: 'warning',
  submitted: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
  reversed: 'danger',
};

function stateText(state: ResourceState): string {
  if (state.state === 'NOT_CONFIGURED') return 'Not configured';
  if (state.state === 'PENDING') return 'Pending';
  if (state.state === 'EMPTY') return 'No data yet';
  return 'Unavailable';
}

export default async function DashboardPage() {
  await requireProvisionedUser();
  let overview;
  let loadError = false;
  try {
    overview = await getOverviewState();
  } catch {
    overview = null;
    loadError = true;
  }

  const capital = overview?.capital;
  const activity = overview?.activity.state === 'VALUE' ? overview.activity.value : [];

  return (
    <Stack>
      <header>
        <h1>Overview</h1>
        <p className="mt-1 text-sm text-text-muted">Capital state, attention, and the next governed decision.</p>
      </header>

      <section className="border-y border-border-hairline py-6">
        {loadError ? (
          <div>
            <p className="text-sm font-medium">Capital position is unavailable</p>
            <p className="mt-1 text-sm text-text-muted">The Neptlium API could not load the current account state. Try again later.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Total capital</p>
              <span className="mt-2 block text-[2.5rem] font-medium leading-none text-text-primary sm:text-[2.75rem]">{capital ? stateText(capital.total) : 'Unavailable'}</span>
            </div>
            <dl className="grid grid-cols-3 gap-4">
              {[
                ['Available', capital?.available],
                ['Reserved', capital?.reserved],
                ['Allocated', capital?.allocated],
              ].map(([label, state]) => (
                <div key={label as string}>
                  <dt className="text-xs text-text-muted">{label as string}</dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary sm:text-base">{state ? stateText(state as ResourceState) : 'Unavailable'}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Portfolio">
          <Surface className="px-4 sm:px-5">
            <Link href="/dashboard/portfolio" className="flex min-h-20 items-center gap-4 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Capital exposure</p>
                <p className="mt-1 text-xs text-text-muted">{overview ? stateText(overview.portfolio) : 'Unavailable'}</p>
              </div>
              <ArrowRight className="size-4 text-text-muted" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>

        <Section title="Capital Account">
          <Surface className="px-4 sm:px-5">
            <Link href="/dashboard/wallet" className="flex min-h-20 items-center gap-4 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Controlled capital state</p>
                <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  {(['usdc', 'ethereum', 'bitcoin'] as const).map((id) => (
                    <span key={id} className="inline-flex items-center gap-1.5">
                      <IdentityMark identity={identityRegistry[id]} size="xs" decorative />
                      {identityRegistry[id].symbol}
                    </span>
                  ))}
                </span>
              </div>
              <span className="text-sm font-medium text-text-primary">{capital ? stateText(capital.total) : 'Unavailable'}</span>
              <ArrowRight className="size-4 text-text-muted" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>

        <Section title="Treasury">
          <Surface className="px-4 sm:px-5">
            <Link href="/dashboard/treasury" className="flex min-h-20 items-center gap-4 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Liquidity and reserves</p>
                <p className="mt-1 text-xs text-text-muted">{overview ? stateText(overview.treasury) : 'Unavailable'}</p>
              </div>
              <ArrowRight className="size-4 text-text-muted" aria-hidden="true" />
            </Link>
          </Surface>
        </Section>

        <Section title="Allocation">
          <Surface className="px-4 sm:px-5">
            <Row>
              <div>
                <p className="text-sm font-medium">Current policy</p>
                <p className="text-xs text-text-muted">{overview ? stateText(overview.allocation) : 'Unavailable'}</p>
              </div>
              <Link href="/dashboard/allocations" className="text-sm font-medium text-accent-primary">Review allocation</Link>
            </Row>
          </Surface>
        </Section>
      </div>

      <Section
        title="Capital activity"
        action={<Link href="/dashboard/transactions" className="text-sm text-accent-primary">See all</Link>}
      >
        <Surface className="px-4 sm:px-5">
          {loadError ? (
            <p className="py-7 text-sm text-text-muted">Capital activity could not be loaded. Try again later.</p>
          ) : activity.length === 0 ? (
            <div className="py-7">
              <p className="text-sm font-medium text-text-primary">No capital activity yet.</p>
              <p className="mt-1 text-sm text-text-muted">Activity will appear here when canonical account events are available.</p>
            </div>
          ) : (
            <Group>
              {activity.map((item) => (
                <Row key={item.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <AssetIdentity asset={item.asset} network={item.network} size="sm" />
                    <p className="text-sm capitalize">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <AssetAmount value={Number(item.amount)} asset={item.asset as 'USDC' | 'ETH' | 'BTC'} className="text-sm" />
                    <div className="mt-1"><Badge tone={tone[item.status] ?? 'neutral'}>{item.status.replaceAll('_', ' ')}</Badge></div>
                  </div>
                </Row>
              ))}
            </Group>
          )}
        </Surface>
      </Section>
    </Stack>
  );
}
