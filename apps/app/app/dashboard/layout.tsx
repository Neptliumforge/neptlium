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
        brandDescriptor="Capital operating environment"
        sidebar={<Sidebar items={navItems} />}
        sidebarFooter={<Sidebar items={secondaryItems} />}
        header={
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0">
              <p className="neptlium-meta">Workspace</p>
              <p className="mt-1 truncate text-sm font-medium text-text-primary">{displayName}</p>
            </div>
            <span className="hidden h-8 w-px bg-border-hairline xl:block" aria-hidden="true" />
            <div className="hidden xl:block">
              <p className="text-[11px] font-medium text-text-secondary">Capital state</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Governed operating context</p>
            </div>
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
