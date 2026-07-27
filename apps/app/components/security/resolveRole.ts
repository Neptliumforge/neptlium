import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { type Role } from "@neptlium/lib";

const KNOWN_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager", "admin", "super_admin"];

/**
 * Resolves a user's role from the `user_roles` table (source of truth), not
 * from `auth.user_metadata`, which is client-influenced and cannot be trusted
 * for access control. Defaults to "user" if no row exists or the stored value
 * isn't a recognized role.
 */
export async function resolveRole(userId: string): Promise<Role> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();

  const role = data?.role;
  return typeof role === "string" && (KNOWN_ROLES as readonly string[]).includes(role) ? (role as Role) : "user";
}
