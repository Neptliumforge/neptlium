import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { hasRole, type Role } from "@neptlium/lib";
import { AdminLoginForm } from "./AdminLoginForm";

function safeInternalPath(value: string | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://neptlium.invalid");
    return url.origin === "https://neptlium.invalid"
      ? `${url.pathname}${url.search}`
      : fallback;
  } catch {
    return fallback;
  }
}

export default async function AdminLoginPage({
  searchParams
}: {
  readonly searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const db = createSupabaseAdminClient();
    const { data: roleRow } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleRow && hasRole(roleRow.role as Role, "admin")) {
      redirect("/dashboard");
    }
    redirect("/unauthorized");
  }

  const params = await searchParams;
  return <AdminLoginForm next={safeInternalPath(params.next)} />;
}
