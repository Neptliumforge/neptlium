import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell, MobileNavigation, Sidebar } from '@neptlium/ui';
import {
  dashboardMobilePrimaryNavItems,
  dashboardMobileSecondaryNavItems,
  dashboardNavItems,
  dashboardSecondaryNavItems,
} from '@/components/navigation/dashboardNav';
import { ProfileMenu } from '@/components/navigation/ProfileMenu';
import { filterNavByRole } from '@/components/security/filterNavByRole';
import { resolveRole } from '@/components/security/resolveRole';
import { requireProvisionedUser } from '@/lib/auth';

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const { user, profile } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);
  const secondaryItems = filterNavByRole(dashboardSecondaryNavItems, role);
  const mobilePrimaryItems = filterNavByRole(dashboardMobilePrimaryNavItems, role);
  const mobileSecondaryItems = filterNavByRole(dashboardMobileSecondaryNavItems, role);
  const displayName = profile.fullName ?? profile.displayName ?? profile.email ?? user.email ?? 'Account';
  const profileMenu = (
    <ProfileMenu
      name={displayName}
      email={profile.email ?? user.email ?? ''}
      verified={profile.complianceStatus === 'active'}
    />
  );

  return (
    <>
      <Link href="#app-workspace" className="app-skip-link">Skip to application workspace</Link>
      <AppShell
       brandDescriptor="Capital intelligence"
        brandTone="teal"
        sidebar={<Sidebar items={navItems} />}
        sidebarFooter={<Sidebar items={secondaryItems} />}
        header={
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
          </div>
        }
        utility={<div className="flex items-center gap-3">{profileMenu}</div>}
        mobileNav={
          <MobileNavigation
            primaryItems={mobilePrimaryItems}
            secondaryItems={mobileSecondaryItems}
            profile={profileMenu}
          />
        }
      >
        <div id="app-workspace" tabIndex={-1}>{children}</div>
      </AppShell>
    </>
  );
}
