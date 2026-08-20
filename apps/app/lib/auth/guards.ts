import { redirect } from "next/navigation";
import { hasRole, type Role } from "@neptlium/lib/rbac";
import { resolveRole } from "@/components/security/resolveRole";
import { getCurrentProfile, getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

/**
 * Gates access to the dashboard on account provisioning having completed.
 * A confirmed user with no provisioned_at yet is mid intake — send them back
 * to the onboarding wizard instead of an incomplete dashboard.
 */
export async function requireProvisionedUser() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (!profile?.provisionedAt) {
    redirect("/onboarding");
  }

  return { user, profile };
}

export async function requireRole(minRole: Role) {
  const user = await requireUser();
  const role = await resolveRole(user.id);

  if (!hasRole(role, minRole)) {
    redirect("/dashboard");
  }

  return { user, role };
}
