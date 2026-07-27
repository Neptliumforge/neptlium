import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@neptlium/ui";
import { getRoleLabel, hasRole, type Role } from "@neptlium/lib";
import { requireAdminUser } from "@/lib/auth";
import { getUserById } from "@/lib/data/users";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UserRolePicker } from "@/components/admin/UserRolePicker";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { updateUserRole, suspendUser, activateUser } from "./actions";
import { Button } from "@neptlium/ui";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatAmount(amount: number | null, asset: string | null): string {
  if (amount === null) return "—";
  const symbol = asset === "USD" ? "$" : `${asset ?? ""} `;
  return `${symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function UserDetailPage({
  params
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { role: adminRole } = await requireAdminUser();
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const isSuperAdmin = hasRole(adminRole, "super_admin");
  const isSuspended = user.compliance_status === "suspended";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-secondary mb-4"
        >
          <ArrowLeft className="size-3.5" />
          Back to Users
        </Link>
        <PageHeader
          title={user.full_name ?? user.email ?? "User"}
          {...(user.email ? { description: user.email } : {})}
          {...(user.compliance_status ? { badge: <StatusBadge status={user.compliance_status} /> } : {})}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Profile + Role + Actions */}
        <div className="space-y-5">
          {/* Profile details */}
          <div className="rounded-lg border border-border-default bg-surface-card p-5">
            <h2 className="text-[13px] font-semibold text-text-primary mb-4">Profile</h2>
            <dl className="space-y-3">
              {[
                ["User ID", <span key="id" className="font-mono text-[11px]">{user.id}</span>],
                ["Email", user.email ?? "—"],
                ["Display Name", user.display_name ?? "—"],
                ["Investor Type", user.investor_type ?? "—"],
                ["Provisioned", formatDate(user.provisioned_at)],
                ["Wallets", String(user.wallets.length)]
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-2">
                  <dt className="text-[12px] text-text-muted shrink-0">{label}</dt>
                  <dd className="text-[12px] text-text-secondary text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Role management */}
          <div className="rounded-lg border border-border-default bg-surface-card p-5">
            <h2 className="text-[13px] font-semibold text-text-primary mb-4">Role</h2>
            <UserRolePicker
              userId={user.id}
              currentRole={(user.role as Role) ?? "user"}
              onUpdate={updateUserRole}
              isSuperAdmin={isSuperAdmin}
            />
          </div>

          {/* Account actions */}
          <div className="rounded-lg border border-border-default bg-surface-card p-5">
            <h2 className="text-[13px] font-semibold text-text-primary mb-4">Account</h2>
            <div className="flex flex-col gap-2">
              {isSuspended ? (
                <ConfirmDialog
                  trigger={
                    <Button variant="primary" size="sm" className="w-full">
                      Activate Account
                    </Button>
                  }
                  title="Activate account"
                  description={`This will restore access for ${user.email ?? "this user"}.`}
                  confirmLabel="Activate"
                  onConfirm={async () => { await activateUser(user.id); }}
                />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm" className="w-full">
                      Suspend Account
                    </Button>
                  }
                  title="Suspend account"
                  description={`This will prevent ${user.email ?? "this user"} from accessing the platform.`}
                  confirmLabel="Suspend"
                  destructive
                  onConfirm={async () => { await suspendUser(user.id); }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right column: Transactions + Login history */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent transactions */}
          <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
            <div className="border-b border-border-hairline px-5 py-4">
              <h2 className="text-[13px] font-semibold text-text-primary">Recent Transactions</h2>
            </div>
            {user.transactions.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-muted">No transactions.</p>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border-hairline">
                    {["Type", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {user.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-2.5 capitalize text-text-secondary">{tx.type}</td>
                      <td className="px-4 py-2.5 font-mono text-text-primary">
                        {formatAmount(tx.amount, tx.asset)}
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={tx.status} /></td>
                      <td className="px-4 py-2.5 text-text-muted">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Login history */}
          <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
            <div className="border-b border-border-hairline px-5 py-4">
              <h2 className="text-[13px] font-semibold text-text-primary">Login History</h2>
            </div>
            {user.loginHistory.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-muted">No login history.</p>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border-hairline">
                    {["Event", "User Agent", "Date"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {user.loginHistory.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-2.5 capitalize text-text-secondary">
                        {event.event_type.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted truncate max-w-[260px]">
                        {event.user_agent ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted whitespace-nowrap">
                        {formatDate(event.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
