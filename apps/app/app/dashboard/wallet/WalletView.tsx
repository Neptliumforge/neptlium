'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Badge, Button, Group, Row, Section, Stack, Surface } from '@neptlium/ui';
import type {
  CanonicalBalance,
  FundingActivity,
  FundingCapability,
  TransferActivity,
  TransferAlias,
} from '@/lib/api/financial';

interface Props {
  readonly capabilities: readonly FundingCapability[];
  readonly capabilityError: boolean;
  readonly balances: readonly CanonicalBalance[];
  readonly balanceError: boolean;
  readonly fundingActivity: readonly FundingActivity[];
  readonly fundingActivityError: boolean;
  readonly transferCapabilities: readonly FundingCapability[];
  readonly transferActivity: readonly TransferActivity[];
  readonly aliases: readonly TransferAlias[];
}

type Tab = 'Overview' | 'Deposit' | 'Transfer' | 'Activity';
const tabs: readonly Tab[] = ['Overview', 'Deposit', 'Transfer', 'Activity'];
const decimals: Readonly<Record<string, number>> = { USD: 2, USDC: 6, ETH: 18, BTC: 8, XRP: 6 };

function formatAtomic(value: string, asset: string): string {
  const places = decimals[asset];
  if (places === undefined || !/^[-]?\d+$/.test(value)) return `${value} atomic ${asset}`;
  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const padded = digits.padStart(places + 1, '0');
  const whole = padded.slice(0, -places) || '0';
  const fraction = places ? padded.slice(-places).replace(/0+$/, '') : '';
  const numeric = `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
  return asset === 'USD' ? `${numeric} USD` : `${numeric} ${asset}`;
}

function capabilityLabel(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'Enabled';
  if (state === 'INELIGIBLE') return 'Ineligible';
  if (state === 'NOT_CONFIGURED') return 'Not configured';
  return 'Unavailable';
}
function capabilityTone(state: FundingCapability['state']): 'success' | 'warning' | 'neutral' {
  if (state === 'ENABLED') return 'success';
  if (state === 'INELIGIBLE') return 'warning';
  return 'neutral';
}
function activityTone(state: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (['AVAILABLE', 'RECONCILED'].includes(state)) return 'success';
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(state)) return 'danger';
  if (['CANCELLED'].includes(state)) return 'neutral';
  return 'warning';
}

export function WalletView({
  capabilities,
  capabilityError,
  balances,
  balanceError,
  fundingActivity,
  fundingActivityError,
  transferCapabilities,
  transferActivity,
  aliases,
}: Props) {
  const [active, setActive] = useState<Tab>('Overview');
  const anyDepositEnabled = capabilities.some((item) => item.state === 'ENABLED');
  const anyTransferEnabled = transferCapabilities.some((item) => item.state === 'ENABLED');

  return (
    <Stack className="py-1">
      <header>
        <h1>Capital Account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your canonical Neptlium ledger claims, funding capability, and governed movement state.
        </p>
      </header>

      <section className="border-y border-border-hairline py-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Canonical balances</p>
        {balanceError ? (
          <State title="Balances unavailable" copy="Canonical ledger balances could not be loaded." />
        ) : balances.length === 0 ? (
          <div className="mt-3">
            <p className="text-lg font-medium">No available capital yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Capital appears only after verified provider evidence, balanced ledger posting, and reconciliation.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {balances.map((balance) => (
              <Surface key={`${balance.asset}:${balance.network ?? ''}`} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{balance.asset}</p>
                    <p className="text-xs text-text-muted">{balance.network ?? (balance.asset === 'USD' ? 'USD denomination' : 'Network unspecified')}</p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{formatAtomic(balance.total_atomic, balance.asset)}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="text-text-muted">Available</dt><dd className="mt-1 font-medium tabular-nums">{formatAtomic(balance.available_atomic, balance.asset)}</dd></div>
                  <div><dt className="text-text-muted">Reserved</dt><dd className="mt-1 font-medium tabular-nums">{formatAtomic(balance.reserved_atomic, balance.asset)}</dd></div>
                  <div><dt className="text-text-muted">Pending</dt><dd className="mt-1 font-medium tabular-nums">{formatAtomic(balance.pending_atomic, balance.asset)}</dd></div>
                  <div><dt className="text-text-muted">Restricted</dt><dd className="mt-1 font-medium tabular-nums">{formatAtomic(balance.restricted_atomic, balance.asset)}</dd></div>
                </dl>
              </Surface>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setActive('Deposit')} disabled={!anyDepositEnabled}>
            <ArrowDownToLine className="size-4" /> Deposit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setActive('Transfer')} disabled={!anyTransferEnabled}>
            <ArrowUpFromLine className="size-4" /> Transfer
          </Button>
        </div>
      </section>

      <div className="flex overflow-x-auto border-b border-border-hairline" role="tablist" aria-label="Capital Account sections">
        {tabs.map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={active === tab} onClick={() => setActive(tab)}
            className={`min-h-11 shrink-0 px-4 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {active === 'Overview' && (
        <Section title="Funding readiness">
          {capabilityError ? (
            <State title="Capability state unavailable" copy="The API could not establish current live funding capability." />
          ) : (
            <Surface className="px-4 sm:px-5">
              <Group>
                {capabilities.map((item) => (
                  <Row key={item.code}>
                    <div>
                      <p className="text-sm font-medium">{item.asset} · {item.network}</p>
                      <p className="mt-1 text-xs text-text-muted">{item.code.replaceAll('_', ' ')}</p>
                    </div>
                    <Badge tone={capabilityTone(item.state)}>{capabilityLabel(item.state)}</Badge>
                  </Row>
                ))}
              </Group>
            </Surface>
          )}
        </Section>
      )}

      {active === 'Deposit' && (
        <Section title="Deposit capital">
          <Surface className="px-4 sm:px-5">
            <Group>
              {capabilities.map((item) => (
                <Row key={item.code}>
                  <div>
                    <p className="text-sm font-medium">{item.asset}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.network}</p>
                  </div>
                  <Badge tone={capabilityTone(item.state)}>{capabilityLabel(item.state)}</Badge>
                </Row>
              ))}
            </Group>
          </Surface>
          {!anyDepositEnabled && (
            <State title="No live deposit rail is enabled" copy="Neptlium will not display a treasury deposit route until the API has created a user-specific governed route for an enabled funding intent." />
          )}
        </Section>
      )}

      {active === 'Transfer' && (
        <Section title="Treasury transfer">
          <Surface className="px-4 sm:px-5">
            <Group>
              {transferCapabilities.map((item) => (
                <Row key={item.code}>
                  <div><p className="text-sm font-medium">{item.asset} · {item.network}</p><p className="mt-1 text-xs text-text-muted">Governed transfer rail</p></div>
                  <Badge tone={capabilityTone(item.state)}>{capabilityLabel(item.state)}</Badge>
                </Row>
              ))}
            </Group>
          </Surface>
          <p className="mt-4 text-sm text-text-muted">
            {aliases.length} destination alias{aliases.length === 1 ? '' : 'es'} recorded. Only verified, active aliases can enter transfer execution.
          </p>
          {!anyTransferEnabled && (
            <State title="Transfers are unavailable" copy="Outbound requests remain closed until provider capability, authorization, durable reservation, settlement, and reconciliation controls are activated." />
          )}
        </Section>
      )}

      {active === 'Activity' && (
        <Section title="Funding and transfer activity">
          {fundingActivityError ? (
            <State title="Funding activity unavailable" copy="The canonical funding activity feed could not be loaded." />
          ) : fundingActivity.length === 0 && transferActivity.length === 0 ? (
            <State title="No governed activity yet" copy="Funding and transfer records will appear here when canonical intents exist." />
          ) : (
            <Surface className="px-4 sm:px-5">
              <Group>
                {fundingActivity.map((item) => (
                  <Row key={`funding:${item.id}`}>
                    <div><p className="text-sm font-medium">Deposit · {item.asset}</p><p className="mt-1 text-xs text-text-muted">{item.rail} · {new Date(item.created_at).toLocaleString()}</p></div>
                    <Badge tone={activityTone(item.state)}>{item.state.replaceAll('_', ' ')}</Badge>
                  </Row>
                ))}
                {transferActivity.map((item) => (
                  <Row key={`transfer:${item.id}`}>
                    <div><p className="text-sm font-medium">Transfer · {item.asset}</p><p className="mt-1 text-xs text-text-muted">{item.rail} · {new Date(item.created_at).toLocaleString()}</p></div>
                    <Badge tone={activityTone(item.state)}>{item.state.replaceAll('_', ' ')}</Badge>
                  </Row>
                ))}
              </Group>
            </Surface>
          )}
        </Section>
      )}
    </Stack>
  );
}

function State({ title, copy }: { readonly title: string; readonly copy: string }) {
  return (
    <div className="py-5">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-2xl text-sm text-text-muted">{copy}</p>
    </div>
  );
}
