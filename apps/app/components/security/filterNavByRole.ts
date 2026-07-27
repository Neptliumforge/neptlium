import { hasRole, type Role } from "@neptlium/lib";
import type { RoleAwareNavItem } from "../navigation/dashboardNav";

export function filterNavByRole(
  items: readonly RoleAwareNavItem[],
  role: Role
): readonly RoleAwareNavItem[] {
  return items.filter((item) => hasRole(role, item.minRole));
}
