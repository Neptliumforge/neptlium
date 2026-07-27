import { redirect } from "next/navigation";
import { hasRole, type Role } from "@neptlium/lib";
import { getCurrentAdminUser, getCurrentAdminRole } from "./session";

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const role = await getCurrentAdminRole(user.id);
  if (!role || !hasRole(role, "admin")) redirect("/unauthorized");

  return { user, role: role as Role };
}

export async function requireSuperAdmin() {
  const { user, role } = await requireAdminUser();
  if (!hasRole(role, "super_admin")) redirect("/unauthorized");
  return { user, role };
}
