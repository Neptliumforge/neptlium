import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Badge, Card, CardContent, EmptyState, Input } from "@netlium/ui";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const PAGE_SIZE = 20;

const STATUS_TONE: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
  cancelled: "neutral",
};

const selectClasses =
  "h-10 rounded-md border border-border-default bg-surface-2 px-3 text-body text-text-primary transition-colors duration-150 ease-out focus:border-border-focus focus:outline-none focus:shadow-[var(--shadow-focus-ring)]";

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

export default async function TransactionsPage({
  searchParams,
}: {
  readonly searchParams: Promise<TransactionsSearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data: distinctRows } = await supabase
    .from("wallet_transactions")
    .select("asset, network")
    .eq("profile_id", user.id);

  const assets = [...new Set((distinctRows ?? []).map((row) => row.asset))];
  const networks = [...new Set((distinctRows ?? []).map((row) => row.network))];

  let query = supabase
    .from("wallet_transactions")
    .select(
      "id, type, asset, network, amount, status, reference, counterparty, created_at",
      { count: "exact" },
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.status) query = query.eq("status", params.status);
  if (params.asset) query = query.eq("asset", params.asset);
  if (params.network) query = query.eq("network", params.network);
  if (params.q)
    query = query.or(
      `reference.ilike.%${params.q}%,counterparty.ilike.%${params.q}%`,
    );

  const { data, count } = await query;
  const transactions = (data ?? []) as readonly TransactionRow[];
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  function pageHref(targetPage: number): string {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.asset) search.set("asset", params.asset);
    if (params.network) search.set("network", params.network);
    if (params.q) search.set("q", params.q);
    if (targetPage > 1) search.set("page", String(targetPage));
    const query = search.toString();
    return query
      ? `/dashboard/transactions?${query}`
      : "/dashboard/transactions";
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">
          Capital Activity
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Review deposits, withdrawals, goals, journal entries, and
          database-backed activity
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="q"
                className="text-body-sm font-medium text-text-secondary"
              >
                Search
              </label>
              <Input
                id="q"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Reference or counterparty"
                className="h-10 w-56"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status"
                className="text-body-sm font-medium text-text-secondary"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={params.status ?? ""}
                className={selectClasses}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="asset"
                className="text-body-sm font-medium text-text-secondary"
              >
                Asset
              </label>
              <select
                id="asset"
                name="asset"
                defaultValue={params.asset ?? ""}
                className={selectClasses}
              >
                <option value="">All assets</option>
                {assets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="network"
                className="text-body-sm font-medium text-text-secondary"
              >
                Network
              </label>
              <select
                id="network"
                name="network"
                defaultValue={params.network ?? ""}
                className={selectClasses}
              >
                <option value="">All networks</option>
                {networks.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-10 rounded-md bg-accent-emerald px-4 text-body-sm font-medium text-accent-emerald-foreground hover:brightness-105"
            >
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="size-5" aria-hidden="true" />}
            title="No transactions found"
            description="Activity will appear here once your account begins moving capital, or adjust your filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="border-b border-border-default">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Asset / Network
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-secondary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border-hairline"
                  >
                    <td className="px-4 py-2 capitalize text-text-primary">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-2 text-text-primary">
                      {transaction.asset} &middot; {transaction.network}
                    </td>
                    <td className="px-4 py-2 text-text-primary">
                      {transaction.type === "withdrawal" ? "-" : ""}
                      {Number(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 font-mono text-text-secondary">
                      {transaction.reference ?? transaction.counterparty ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        tone={STATUS_TONE[transaction.status] ?? "neutral"}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-text-muted">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-hairline p-4">
            <p className="text-body-sm text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-md border border-border-default px-3 py-1.5 text-body-sm text-text-primary hover:bg-surface-2"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-md border border-border-default px-3 py-1.5 text-body-sm text-text-primary hover:bg-surface-2"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
