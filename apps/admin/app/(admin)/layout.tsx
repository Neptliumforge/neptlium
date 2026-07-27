import type { ReactNode } from "react";

// Admin routes are always server-rendered at request time — never pre-rendered.
export const dynamic = "force-dynamic";
import { requireAdminUser } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { adminNavItems } from "@/components/navigation/adminNav";

export default async function AdminLayout({ children }: { readonly children: ReactNode }) {
  const { user, role } = await requireAdminUser();

  // Fetch display name for topbar
  const db = createSupabaseAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? profile?.full_name ?? user.email ?? null;

  return (
    <AdminShell
      sidebar={<AdminSidebar items={adminNavItems} />}
      topbar={<AdminTopbar user={user} role={role} displayName={displayName} />}
    >
      {children}
    </AdminShell>
  );
}
