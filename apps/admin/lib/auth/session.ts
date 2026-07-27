import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { type Role } from "@neptlium/lib";

const KNOWN_ROLES: readonly Role[] = [
  "user",
  "operator",
  "analyst",
  "manager",
  "admin",
  "super_admin"
];

export async function getCurrentAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentAdminRole(userId: string): Promise<Role | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const role = data?.role;
  return typeof role === "string" && (KNOWN_ROLES as readonly string[]).includes(role)
    ? (role as Role)
    : null;
}
