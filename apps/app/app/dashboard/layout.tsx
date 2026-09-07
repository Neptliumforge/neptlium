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
      <Link href="#app-workspace" className="app-skip-link">
        Skip to application workspace
      </Link>
      <AppShell
        brandDescriptor="Operating environment"
        sidebar={<Sidebar items={navItems} />}
        sidebarFooter={<Sidebar items={secondaryItems} />}
        header={
          <div className="flex min-w-0 items-center gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.03em] text-text-muted">Current workspace</p>
              <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
            </div>
            <span className="hidden h-7 w-px bg-border-hairline xl:block" aria-hidden="true" />
            <p className="hidden text-xs text-text-muted xl:block">Capital operating environment</p>
          </div>
        }
        utility={
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings#support" className="text-sm text-text-muted hover:text-text-primary">Support</Link>
            {profileMenu}
          </div>
        }
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
