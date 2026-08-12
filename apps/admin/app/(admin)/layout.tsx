import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
import { requireAdminUser } from "@/lib/auth";
import { getCurrentAdminContext } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { adminNavItems } from "@/components/navigation/adminNav";

export default async function AdminLayout({ children }: { readonly children: ReactNode }) {
  const { user, role } = await requireAdminUser();
  const context = await getCurrentAdminContext();
  const displayName = context?.displayName ?? context?.fullName ?? user.email ?? null;

  return (
    <AdminShell
      sidebar={<AdminSidebar items={adminNavItems} />}
      topbar={<AdminTopbar user={user} role={role} displayName={displayName} />}
    >
      {children}
    </AdminShell>
  );
}
