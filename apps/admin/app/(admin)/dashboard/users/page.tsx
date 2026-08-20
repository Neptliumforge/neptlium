import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { getUsers, PAGE_SIZE } from "@/lib/data/users";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaginationRow } from "@/components/admin/PaginationRow";
import { Badge } from "@neptlium/ui";
import { getRoleLabel, type Role } from "@neptlium/lib/rbac";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default async function UsersPage({
  searchParams
}: {
  readonly searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0));
  const { rows, total } = await getUsers({
    page,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {})
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${total} total users`}
      />

      <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-hairline">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Provisioned
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-1/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{user.full_name ?? "—"}</p>
                      <p className="text-text-muted text-[11px]">{user.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {user.role ? (
                        <Badge tone="neutral">{getRoleLabel(user.role as Role)}</Badge>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.compliance_status ? (
                        <StatusBadge status={user.compliance_status} />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">
                      {user.investor_type ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(user.provisioned_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="text-accent-primary hover:brightness-110 text-[12px] font-medium"
                      >
                        View
                      </Link>
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
