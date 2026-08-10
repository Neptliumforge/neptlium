import Link from 'next/link';
import { AssetAmount, AssetIdentity, Badge, Input, Surface } from '@neptlium/ui';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { requireUser } from '@/lib/auth';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  pending: 'warning',
  pending_review: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
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

interface TransactionRow {
  readonly id: string;
  readonly type: string;
  readonly asset: string;
  readonly network: string;
  readonly amount: number;
  readonly status: string;
  readonly reference: string | null;
  readonly counterparty: string | null;
  readonly created_at: string;
}

export default async function TransactionsPage({ searchParams }: { readonly searchParams: Promise<TransactionsSearchParams> }) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data: distinctRows } = await supabase
    .from('wallet_transactions')
    .select('asset, network')
    .eq('profile_id', user.id);

  const assets = [...new Set((distinctRows ?? []).map((row) => row.asset))];
  const networks = [...new Set((distinctRows ?? []).map((row) => row.network))];

  let query = supabase
    .from('wallet_transactions')
    .select('id, type, asset, network, amount, status, reference, counterparty, created_at', { count: 'exact' })
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.status) query = query.eq('status', params.status);
  if (params.asset) query = query.eq('asset', params.asset);
  if (params.network) query = query.eq('network', params.network);
  if (params.q) query = query.or(`reference.ilike.%${params.q}%,counterparty.ilike.%${params.q}%`);

  const { data, count } = await query;
  const transactions = (data ?? []) as readonly TransactionRow[];
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

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
        <p className="mt-1 text-sm text-text-muted">Canonical account activity and its operational state.</p>
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
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="asset">
            Asset
            <select id="asset" name="asset" defaultValue={params.asset ?? ''} className={selectClasses}>
              <option value="">All assets</option>
              {assets.map((asset) => <option key={asset} value={asset}>{asset}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-text-secondary" htmlFor="network">
            Network
            <select id="network" name="network" defaultValue={params.network ?? ''} className={selectClasses}>
              <option value="">All networks</option>
              {networks.map((network) => <option key={network} value={network}>{network}</option>)}
            </select>
          </label>
          <button type="submit" className="h-10 rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Filter</button>
        </form>
      </Surface>

      <Surface>
        {transactions.length === 0 ? (
          <div className="px-5 py-8">
            <p className="text-sm font-medium">No capital activity yet.</p>
            <p className="mt-1 text-sm text-text-muted">Activity will appear here when canonical account events are available. Adjust filters if you expected an existing event.</p>
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
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border-hairline last:border-0">
                    <td className="px-4 py-3 capitalize text-text-primary">{transaction.type}</td>
                    <td className="px-4 py-3"><AssetIdentity asset={transaction.asset} network={transaction.network} size="sm" /></td>
                    <td className="px-4 py-3 text-text-primary">
                      <AssetAmount value={Number(transaction.amount)} asset={transaction.asset as 'USDC' | 'ETH' | 'BTC'} className="text-sm" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{transaction.reference ?? transaction.counterparty ?? 'Not available'}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[transaction.status] ?? 'neutral'}>{transaction.status.replaceAll('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 text-text-muted">{new Date(transaction.created_at).toLocaleDateString()}</td>
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
