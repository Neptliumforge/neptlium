import Link from 'next/link';
import { AssetAmount, AssetIdentity, Badge, Input, Surface } from '@neptlium/ui';
import { requireUser } from '@/lib/auth';
import { getCapitalActivity } from '@/lib/api/client';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
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

const selectClasses =
  'h-10 rounded-md border border-border-default bg-surface-1 px-3 text-body text-text-primary transition-colors duration-150 ease-out focus:border-border-focus focus:outline-none focus:shadow-[var(--shadow-focus-ring)]';

interface TransactionsSearchParams {
  readonly status?: string;
  readonly asset?: string;
  readonly network?: string;
  readonly q?: string;
  readonly page?: string;
}

export default async function TransactionsPage({ searchParams }: { readonly searchParams: Promise<TransactionsSearchParams> }) {
  await requireUser();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let result;
  let loadError = false;
  try {
    result = await getCapitalActivity({
      offset,
      limit: PAGE_SIZE,
      ...(params.status ? { status: params.status } : {}),
      ...(params.asset ? { asset: params.asset } : {}),
      ...(params.network ? { network: params.network } : {}),
      ...(params.q ? { q: params.q } : {}),
    });
  } catch {
    result = { state: 'EMPTY' as const, data: [], total: 0, assets: [], networks: [], next_offset: null };
    loadError = true;
  }

  const totalPages = result.total ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  function pageHref(targetPage: number): string {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.asset) search.set('asset', params.asset);
    if (params.network) search.set('network', params.network);
    if (params.q) search.set('q', params.q);
    if (targetPage > 1) search.set('page', String(targetPage));
    const value = search.toString();
    return value ? `/dashboard/transactions?${value}` : '/dashboard/transactions';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1>Capital Activity</h1>
        <p className="mt-1 text-sm text-text-muted">Account activity and operational state supplied by the Neptlium API.</p>
      </header>

      <Surface className="p-4 sm:p-5">
        <form method="get" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(13rem,1fr)_repeat(3,auto)_auto] xl:items-end">
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="q">
            Search
            <Input id="q" name="q" defaultValue={params.q ?? ''} placeholder="Reference or counterparty" className="h-10" />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="status">
            Status
            <select id="status" name="status" defaultValue={params.status ?? ''} className={selectClasses}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="submitted">Submitted</option>
              <option value="confirming">Confirming</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="reversed">Reversed</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="asset">
            Asset
            <select id="asset" name="asset" defaultValue={params.asset ?? ''} className={selectClasses}>
              <option value="">All assets</option>
              {result.assets.map((asset) => <option key={asset} value={asset}>{asset}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="network">
            Network
            <select id="network" name="network" defaultValue={params.network ?? ''} className={selectClasses}>
              <option value="">All networks</option>
              {result.networks.map((network) => <option key={network} value={network}>{network}</option>)}
            </select>
          </label>
          <button type="submit" className="h-10 rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Filter</button>
        </form>
      </Surface>

      <Surface>
        {loadError ? (
          <div className="px-5 py-8">
            <p className="text-sm font-medium">Capital activity is unavailable.</p>
            <p className="mt-1 text-sm text-text-muted">The Neptlium API could not load account activity. Try again later.</p>
          </div>
        ) : result.data.length === 0 ? (
          <div className="px-5 py-8">
            <p className="text-sm font-medium">No capital activity yet.</p>
            <p className="mt-1 text-sm text-text-muted">Activity will appear here when account events are available. Adjust filters if you expected an existing event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-hairline bg-surface-2/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Asset / Network</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Reference</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">State</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Time</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border-hairline last:border-0">
                    <td className="px-4 py-3 capitalize text-text-primary">{transaction.type}</td>
                    <td className="px-4 py-3"><AssetIdentity asset={transaction.asset} network={transaction.network} size="sm" /></td>
                    <td className="px-4 py-3 text-text-primary">
                      <AssetAmount value={Number(transaction.amount)} asset={transaction.asset as 'USDC' | 'ETH' | 'BTC'} className="text-sm" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{transaction.reference ?? transaction.counterparty ?? 'Not available'}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[transaction.status] ?? 'neutral'}>{transaction.status.replaceAll('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 text-text-muted">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-hairline p-4">
            <p className="text-sm text-text-muted">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={pageHref(page - 1)} className="rounded-md border border-border-default px-3 py-1.5 text-sm hover:bg-surface-2">Previous</Link>}
              {page < totalPages && <Link href={pageHref(page + 1)} className="rounded-md border border-border-default px-3 py-1.5 text-sm hover:bg-surface-2">Next</Link>}
            </div>
          </div>
        )}
      </Surface>
    </div>
  );
}
