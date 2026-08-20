import { auth, currentUser } from '@clerk/nextjs/server';
import { hasRole, type Role } from "@neptlium/lib/rbac";
import { resolveRole } from "@/components/security/resolveRole";
import { ApiClientError, getAccountContext } from "@/lib/api/client";

export async function getCurrentUser() {
  const session = await auth();
  if (!session.userId) return null;
  const user = await currentUser();
  return {
    id: session.userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
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
 * Clerk is the application session authority. Financial ownership resolves in apps/api.
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
