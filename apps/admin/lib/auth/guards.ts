import { redirect } from "next/navigation";
import { type Role } from "@neptlium/lib/rbac";
import { getCurrentAdminUser, getCurrentAdminRole } from "./session";
import { isGeneralPlatformAdminRole } from "./authorization";

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const role = await getCurrentAdminRole(user.id);
  if (!isGeneralPlatformAdminRole(role)) redirect("/unauthorized");

  return { user, role: role as Role };
}

export async function requireSuperAdmin() {
  return requireAdminUser();
}
