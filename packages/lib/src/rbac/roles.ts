/**
 * Role-based access control hierarchy for Neptlium.
 * Defines institutional roles and their permission levels.
 */

export type Role = "user" | "operator" | "analyst" | "manager" | "admin" | "super_admin";

/**
 * Role hierarchy defines permission levels.
 * Higher numbers have more permissions than lower numbers.
 */
export const roleHierarchy: Record<Role, number> = {
  user: 1,
  operator: 2,
  analyst: 3,
  manager: 4,
  admin: 5,
  super_admin: 6
};

/**
 * Check if a user role has at least the required permission level.
 * Example: hasRole("admin", "manager") → true (admin ≥ manager)
 */
export function hasRole(userRole: Role, required: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[required];
}

/**
 * Get the display name for a role.
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    user: "User",
    operator: "Operator",
    analyst: "Analyst",
    manager: "Manager",
    admin: "Administrator",
    super_admin: "Super Administrator"
  };
  return labels[role];
}
