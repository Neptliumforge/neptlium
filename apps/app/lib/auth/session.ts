import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { hasRole, type Role } from "@neptlium/lib";
import { resolveRole } from "@/components/security/resolveRole";
import { ApiClientError, getAccountContext } from "@/lib/api/client";

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
 * Account/profile business state is resolved through api.neptlium.com.
 * Supabase remains here only for the current authenticated session identity.
 */
export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const context = await getAccountContext();
    return {
      id: context.id,
      email: context.email,
      fullName: context.fullName,
      displayName: context.displayName,
      investorType: context.investorType,
      organizationId: context.organizationId,
      complianceStatus: context.complianceStatus,
      provisionedAt: context.provisionedAt,
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'account_not_provisioned') return null;
    throw error;
  }
}

export async function getCurrentRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return user ? resolveRole(user.id) : null;
}

export async function hasPermission(minRole: Role): Promise<boolean> {
  const role = await getCurrentRole();
  return role !== null && hasRole(role, minRole);
}
