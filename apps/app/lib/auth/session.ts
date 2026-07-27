import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { hasRole, type Role } from "@neptlium/lib";
import { resolveRole } from "@/components/security/resolveRole";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export interface SessionProfile {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
  readonly displayName: string | null;
  readonly investorType: string | null;
  readonly organizationId: string | null;
  readonly complianceStatus: string | null;
  readonly provisionedAt: string | null;
}

/**
 * Loads the current user's `profiles` row, joined on `id` (set to
 * `auth.users.id` by the handle_new_user trigger — `profiles.user_id` is a
 * separate, unpopulated column and must not be used here).
 */
export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, display_name, investor_type, organization_id, compliance_status, provisioned_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    displayName: data.display_name,
    investorType: data.investor_type,
    organizationId: data.organization_id,
    complianceStatus: data.compliance_status,
    provisionedAt: data.provisioned_at
  };
}

export async function getCurrentRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return user ? resolveRole(user.id) : null;
}

export async function hasPermission(minRole: Role): Promise<boolean> {
  const role = await getCurrentRole();
  return role !== null && hasRole(role, minRole);
}
