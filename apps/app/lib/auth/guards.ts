import { redirect } from "next/navigation";
import { hasRole, type Role } from "@neptlium/lib/rbac";
import { resolveRole } from "@/components/security/resolveRole";
import { getCurrentProfile, getCurrentUser, type SessionProfile, type SessionUser } from "./session";

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

function fallbackProfile(user: SessionUser): SessionProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: null,
    displayName: null,
    investorType: null,
    organizationId: null,
    complianceStatus: null,
    provisionedAt: null,
  };
}

/**
 * Dashboard rendering must never treat an unavailable application profile as
 * an authentication failure. Clerk owns the session boundary; account/profile
 * state is optional presentation context and can recover independently.
 */
export async function requireProvisionedUser() {
  const user = await requireUser();
  const profile = await getCurrentProfile(user).catch(() => null);

  return { user, profile: profile ?? fallbackProfile(user) };
}

export async function requireRole(minRole: Role) {
  const user = await requireUser();
  const role = await resolveRole(user.id);

  if (!hasRole(role, minRole)) {
    redirect("/dashboard");
  }

  return { user, role };
}
