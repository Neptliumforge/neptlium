import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { hasRole, type Role } from "@neptlium/lib/rbac";
import { resolveRole } from "@/components/security/resolveRole";
import { ApiClientError, getAccountContext } from "@/lib/api/client";

export interface SessionUser {
  readonly id: string;
  readonly email: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
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

/** Account/profile business state is resolved through api.neptlium.com. */
export async function getCurrentProfile(existingUser?: SessionUser): Promise<SessionProfile | null> {
  const user = existingUser ?? await getCurrentUser();
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
