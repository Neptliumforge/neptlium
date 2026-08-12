import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { type Role } from "@neptlium/lib";
import { adminApiRequest } from "@/lib/api";

const KNOWN_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager", "admin", "super_admin"];

export interface AdminSessionContext {
  id: string;
  email: string | null;
  fullName: string | null;
  displayName: string | null;
  role: Role;
}

export async function getCurrentAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentAdminContext(): Promise<AdminSessionContext | null> {
  try {
    const context = await adminApiRequest<AdminSessionContext>("/v1/admin/session");
    return typeof context.role === "string" && (KNOWN_ROLES as readonly string[]).includes(context.role)
      ? context
      : null;
  } catch {
    return null;
  }
}

export async function getCurrentAdminRole(_userId?: string): Promise<Role | null> {
  return (await getCurrentAdminContext())?.role ?? null;
}
