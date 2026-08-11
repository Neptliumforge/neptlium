import { requireUser } from '@/lib/auth';
import { getFundingActivity, getTransferActivity } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';

function stateFor(value: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(value)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(value)) return 'ERROR' as const;
  if (value === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(value)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

export default async function TransactionsPage() {
  await requireUser();

  const [fundingResult, transferResult] = await Promise.allSettled([
    getFundingActivity(),
    getTransferActivity(),
  ]);

  const error = fundingResult.status === 'rejected' && transferResult.status === 'rejected';
  const funding = fundingResult.status === 'fulfilled' ? fundingResult.value.data : [];
  const transfers = transferResult.status === 'fulfilled' ? transferResult.value.data : [];
  const rows = [
    ...funding.map((item) => ({
      id: item.id,
      type: 'Deposit',
      asset: item.asset,
      network: item.network,
      rail: item.rail,
      amount: item.amount_atomic,
      state: item.state,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
    ...transfers.map((item) => ({
      id: item.id,
      type: 'Transfer',
      asset: item.asset,
      network: item.network,
      rail: item.rail,
      amount: item.amount_atomic,
      state: item.state,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="space-y-6">
      <header>
        <h1>Capital Activity</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Canonical customer funding and governed transfer intents supplied by api.neptlium.com.
        </p>
      </header>

      <div className="border-y border-border-hairline">
        {error ? (
          <ProductStateMessage state="ERROR" title="Capital activity unavailable">The governed activity APIs could not be loaded.</ProductStateMessage>
        ) : rows.length === 0 ? (
          <ProductStateMessage state="NO_ACTIVITY" title="No capital activity yet">Deposits and governed movement will appear here when canonical intents exist.</ProductStateMessage>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(7rem,0.8fr)_minmax(8rem,1fr)_minmax(8rem,auto)_auto_minmax(9rem,auto)] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted md:grid">
              <span>Type</span><span>Asset / network</span><span>Amount</span><span>State</span><span>Updated</span>
            </div>
            {rows.map((row) => (
              <article key={`${row.type}:${row.id}`} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 md:grid-cols-[minmax(7rem,0.8fr)_minmax(8rem,1fr)_minmax(8rem,auto)_auto_minmax(9rem,auto)] md:items-center md:gap-5">
                <div><p className="text-sm font-medium text-text-primary">{row.type}</p><p className="mt-1 text-xs text-text-muted md:hidden">{new Date(row.createdAt).toLocaleString()}</p></div>
                <div><p className="text-sm font-medium text-text-primary">{row.asset}</p><p className="mt-1 text-xs text-text-muted">{row.network ?? row.rail}</p></div>
                <div className="text-sm font-medium">{row.amount ? <FinancialValue valueAtomic={row.amount} asset={row.asset} /> : <span className="text-text-muted">Amount unavailable</span>}</div>
                <ProductStateBadge state={stateFor(row.state)}>{row.state.replaceAll('_', ' ')}</ProductStateBadge>
                <time className="hidden text-xs text-text-muted md:block" dateTime={row.updatedAt}>{new Date(row.updatedAt).toLocaleString()}</time>
              </article>
            ))}
          </>
        )}
      </div>

      <p className="text-xs leading-5 text-text-muted">
        Provider observations are not shown as customer activity unless they have been normalized into governed Neptlium financial state.
      </p>
    </div>
  );
}
