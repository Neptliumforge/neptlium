import { requireAdminUser } from "@/lib/auth";
import { getPendingAllocations, getAllocationHistory, PAGE_SIZE } from "@/lib/data/allocations";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaginationRow } from "@/components/admin/PaginationRow";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge, Button, StatCard } from "@neptlium/ui";
import { approveAllocation, rejectAllocation, executeAllocation } from "./actions";
import Link from "next/link";
import { SlidersHorizontal, Clock } from "lucide-react";

function formatAmount(amount: number | null, asset: string | null): string {
  if (amount === null) return "—";
  return `${asset ?? ""} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function AllocationsPage({
  searchParams
}: {
  readonly searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0));

  const [pending, { rows: history, total }] = await Promise.all([
    getPendingAllocations(),
    getAllocationHistory({ page, ...(params.status ? { status: params.status } : {}) })
  ]);

  return (
    <div>
      <PageHeader
        title="Allocations"
        description="Review capital allocation requests"
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Pending Review"
          value={String(pending.length)}
          icon={<Clock className="size-4" />}
        />
        <StatCard
          label="Total Records"
          value={String(total)}
          icon={<SlidersHorizontal className="size-4" />}
        />
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <div className="mb-6 rounded-lg border border-warning-border bg-surface-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border-hairline px-5 py-4">
            <h2 className="text-[14px] font-semibold text-text-primary">Pending Review</h2>
            <Badge tone="warning">{pending.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-hairline">
                  {["User", "Asset", "Amount", "Notes", "Requested", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {pending.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-1/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{row.user_name ?? "—"}</p>
                      <p className="text-text-muted text-[11px]">{row.user_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{row.asset ?? "—"}</td>
                    <td className="px-4 py-3 font-mono font-medium text-text-primary">
                      {formatAmount(row.amount, row.asset)}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-[11px] max-w-[200px] truncate">
                      {row.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-[11px]">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ConfirmDialog
                          trigger={<Button variant="primary" size="sm">Approve</Button>}
                          title="Approve allocation"
                          description={`Approve a capital allocation of ${formatAmount(row.amount, row.asset)} for ${row.user_email ?? "this user"}.`}
                          confirmLabel="Approve"
                          onConfirm={async () => { await approveAllocation(row.id); }}
                        />
                        <ConfirmDialog
                          trigger={<Button variant="destructive" size="sm">Reject</Button>}
                          title="Reject allocation"
                          description={`Reject this allocation request from ${row.user_email ?? "this user"}.`}
                          confirmLabel="Reject"
                          destructive
                          reasonField
                          reasonLabel="Rejection reason"
                          onReasonConfirm={async (reason) => { await rejectAllocation(row.id, reason); }}
                          onConfirm={async () => {}}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
        <div className="border-b border-border-hairline px-5 py-4">
          <h2 className="text-[14px] font-semibold text-text-primary">All Allocations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-hairline">
                {["User", "Asset", "Amount", "Status", "Notes", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">No allocations found.</td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-1/30">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/users/${row.profile_id}`} className="text-accent-primary hover:brightness-110">
                        {row.user_email ?? row.profile_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{row.asset ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-text-primary">{formatAmount(row.amount, row.asset)}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-text-muted text-[11px] max-w-[160px] truncate">{row.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-text-muted text-[11px]">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      {row.status === "approved" && (
                        <ConfirmDialog
                          trigger={<Button variant="primary" size="sm">Execute</Button>}
                          title="Execute allocation"
                          description="Mark this approved allocation as executed. This confirms funds have been moved."
                          confirmLabel="Execute"
                          onConfirm={async () => { await executeAllocation(row.id); }}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <PaginationRow page={page} total={total} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
