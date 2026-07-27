import { requireAdminUser } from "@/lib/auth";
import { getDeposits, PAGE_SIZE } from "@/lib/data/deposits";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaginationRow } from "@/components/admin/PaginationRow";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@neptlium/ui";
import { markDepositCompleted } from "./actions";
import Link from "next/link";

function formatAmount(amount: number | null): string {
  if (amount === null) return "—";
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function DepositsPage({
  searchParams
}: {
  readonly searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0));
  const { rows, total } = await getDeposits({ page, ...(params.status ? { status: params.status } : {}) });

  return (
    <div>
      <PageHeader
        title="Deposits"
        description={`${total} total deposits — reconcile pending wire receipts`}
      />

      <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-hairline">
                {["User", "Asset", "Amount", "Reference", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">No deposits found.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-1/30">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/users/${row.profile_id}`} className="text-accent-primary hover:brightness-110">
                        {row.user_email ?? row.profile_id.slice(0, 8)}
                      </Link>
                      {row.user_name && (
                        <p className="text-text-muted text-[11px]">{row.user_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{row.asset ?? "—"}</td>
                    <td className="px-4 py-3 font-mono font-medium text-text-primary">
                      {formatAmount(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-text-muted font-mono text-[11px]">
                      {row.reference ?? "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-text-muted text-[11px]">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {(row.status === "pending" || row.status === "pending_review") && (
                        <ConfirmDialog
                          trigger={<Button variant="primary" size="sm">Mark Completed</Button>}
                          title="Mark deposit as completed"
                          description={`Confirm you have received the wire of ${formatAmount(row.amount)} for ${row.user_email ?? "this user"} (ref: ${row.reference ?? "—"}).`}
                          confirmLabel="Mark Completed"
                          onConfirm={async () => { await markDepositCompleted(row.id); }}
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
