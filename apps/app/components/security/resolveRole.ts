import { type Role } from "@neptlium/lib/rbac";
import { getAccountContext } from "@/lib/api/client";

const KNOWN_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager", "admin", "super_admin"];

/**
 * Navigation role is presentation context only. The API remains authoritative
 * for privileged operations, so an unavailable role lookup must not invalidate
 * a valid Clerk session or eject the user from the dashboard shell.
 */
export async function resolveRole(_userId: string): Promise<Role> {
  try {
    const context = await getAccountContext();
    return (KNOWN_ROLES as readonly string[]).includes(context.role)
      ? (context.role as Role)
      : "user";
  } catch {
    return "user";
  }
}
