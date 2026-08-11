import { type Role } from "@neptlium/lib";
import { getAccountContext } from "@/lib/api/client";

const KNOWN_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager", "admin", "super_admin"];

/**
 * Navigation role is read from api.neptlium.com. It is presentation context
 * only; apps/api still performs authoritative server-side authorization for
 * privileged operations.
 */
export async function resolveRole(_userId: string): Promise<Role> {
  const context = await getAccountContext();
  return (KNOWN_ROLES as readonly string[]).includes(context.role)
    ? (context.role as Role)
    : "user";
}
