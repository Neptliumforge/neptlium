import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell, MobileNavigation, Sidebar } from '@neptlium/ui';
import {
  dashboardMobilePrimaryNavItems,
  dashboardMobileSecondaryNavItems,
  dashboardNavItems,
} from '@/components/navigation/dashboardNav';
import { ProfileMenu } from '@/components/navigation/ProfileMenu';
import { filterNavByRole } from '@/components/security/filterNavByRole';
import { resolveRole } from '@/components/security/resolveRole';
import { requireProvisionedUser } from '@/lib/auth';

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const { user, profile } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);
  const mobilePrimaryItems = filterNavByRole(dashboardMobilePrimaryNavItems, role);
  const mobileSecondaryItems = filterNavByRole(dashboardMobileSecondaryNavItems, role);
  const settingsItems = mobileSecondaryItems.filter((item) => item.label === 'Settings');
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
      <Link href="#app-workspace" className="app-skip-link">
        Skip to application workspace
      </Link>
      <AppShell
        sidebar={<Sidebar items={navItems} />}
        sidebarFooter={settingsItems.length ? <Sidebar items={settingsItems} /> : undefined}
        header={
          <div className="flex items-center gap-5 text-sm">
            <Link href="/dashboard/transactions" className="text-text-muted hover:text-text-primary">Activity</Link>
            <Link href="/dashboard/settings#support" className="text-text-muted hover:text-text-primary">Help</Link>
          </div>
        }
        utility={profileMenu}
        mobileNav={
          <MobileNavigation
            primaryItems={mobilePrimaryItems}
            secondaryItems={mobileSecondaryItems}
            profile={profileMenu}
          />
        }
      >
        <div id="app-workspace" tabIndex={-1}>
          {children}
        </div>
      </AppShell>
    </>
  );
}
