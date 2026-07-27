import Link from "next/link";
import { Users, Clock, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { StatCard } from "@neptlium/ui";
import { requireAdminUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data/users";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

function formatAmount(amount: number | null, asset: string | null): string {
  if (amount === null) return "—";
  const symbol = asset === "USD" ? "$" : "";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function DashboardPage() {
  await requireAdminUser();
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader title="Overview" description="Platform health at a glance" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Users"
          value={String(stats.totalUsers)}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Pending Compliance"
          value={String(stats.pendingCompliance)}
          icon={<Clock className="size-4" />}
        />
        <StatCard
          label="Pending Withdrawals"
          value={String(stats.pendingWithdrawals)}
          icon={<ArrowUpRight className="size-4" />}
        />
        <StatCard
          label="Pending Allocations"
          value={String(stats.pendingAllocations)}
          icon={<SlidersHorizontal className="size-4" />}
        />
      </div>

      {/* Quick links for pending queues */}
      {(stats.pendingWithdrawals > 0 || stats.pendingAllocations > 0) && (
        <div className="mb-8 rounded-lg border border-warning-border bg-warning-surface p-4">
          <p className="text-[13px] font-medium text-warning-text mb-2">Items requiring review</p>
          <div className="flex gap-4">
            {stats.pendingWithdrawals > 0 && (
              <Link
                href="/dashboard/withdrawals"
                className="text-[13px] text-accent-primary hover:brightness-110 underline"
              >
                {stats.pendingWithdrawals} withdrawal{stats.pendingWithdrawals !== 1 ? "s" : ""} pending
              </Link>
            )}
            {stats.pendingAllocations > 0 && (
              <Link
                href="/dashboard/allocations"
                className="text-[13px] text-accent-primary hover:brightness-110 underline"
              >
                {stats.pendingAllocations} allocation{stats.pendingAllocations !== 1 ? "s" : ""} pending
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-lg border border-border-default bg-surface-card">
        <div className="flex items-center justify-between border-b border-border-hairline px-5 py-4">
          <h2 className="text-[14px] font-semibold text-text-primary">Recent Transactions</h2>
          <Link
            href="/dashboard/transactions"
            className="text-[12px] text-accent-primary hover:brightness-110"
          >
            View all
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-muted">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-border-hairline">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary capitalize">{tx.type}</p>
                  <p className="text-[11px] text-text-muted font-mono">{tx.id.slice(0, 8)}…</p>
                </div>
                <p className="text-[13px] font-mono text-text-secondary">
                  {formatAmount(tx.amount, tx.asset)}
                </p>
                <StatusBadge status={tx.status} />
                <p className="text-[11px] text-text-muted shrink-0">{formatDate(tx.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
