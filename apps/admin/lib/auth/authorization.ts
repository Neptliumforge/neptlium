export const GENERAL_PLATFORM_ADMIN_ROLE = "super_admin" as const;

export const DELEGABLE_ROLES = ["user", "operator", "analyst", "manager"] as const;

export function isGeneralPlatformAdminRole(role: string | null | undefined): role is typeof GENERAL_PLATFORM_ADMIN_ROLE {
  return role === GENERAL_PLATFORM_ADMIN_ROLE;
}

export function isDelegableRole(role: string): boolean {
  return (DELEGABLE_ROLES as readonly string[]).includes(role);
}
