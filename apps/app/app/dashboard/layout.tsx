import type { ReactNode } from "react";
import { AppShell, MobileNavigation, Sidebar } from "@netlium/ui";
import { dashboardNavItems } from "@/components/navigation/dashboardNav";
import { ProfileMenu } from "@/components/navigation/ProfileMenu";
import { filterNavByRole } from "@/components/security/filterNavByRole";
import { resolveRole } from "@/components/security/resolveRole";
import { requireProvisionedUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { user, profile } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);
  const displayName =
    profile.fullName ??
    profile.displayName ??
    profile.email ??
    user.email ??
    "Account";
  const profileMenu = (
    <ProfileMenu
      name={displayName}
      email={profile.email ?? user.email ?? ""}
      membership={null}
      verified={profile.complianceStatus === "active"}
    />
  );
  return (
    <AppShell
      sidebar={<Sidebar items={navItems} />}
      utility={profileMenu}
      mobileNav={<MobileNavigation items={navItems} profile={profileMenu} />}
    >
      {children}
    </AppShell>
  );
}
