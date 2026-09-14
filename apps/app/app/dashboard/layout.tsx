import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell, Sidebar } from '@neptlium/ui';
import {
  dashboardMobilePrimaryNavItems,
  dashboardNavItems,
  dashboardSecondaryNavItems,
} from '@/components/navigation/dashboardNav';
import { ProductMobileNavigation } from '@/components/navigation/ProductMobileNavigation';
import { ProfileMenu } from '@/components/navigation/ProfileMenu';
import { WorkspaceTitle } from '@/components/navigation/WorkspaceTitle';
import { ProductBootstrapProvider } from '@/components/product/ProductBootstrapProvider';
import { filterNavByRole } from '@/components/security/filterNavByRole';
import { resolveRole } from '@/components/security/resolveRole';
import { requireProvisionedUser } from '@/lib/auth';
import { getAuthenticatedProductBootstrap } from '@/lib/product/bootstrap';

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const { user, profile } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);
  const secondaryItems = filterNavByRole(dashboardSecondaryNavItems, role);
  const mobilePrimaryItems = filterNavByRole(dashboardMobilePrimaryNavItems, role);
  const displayName = profile.fullName ?? profile.displayName ?? profile.email ?? user.email ?? 'Account';
  const profileMenu = <ProfileMenu name={displayName} email={profile.email ?? user.email ?? ''} verified={profile.complianceStatus === 'active'} />;
  const bootstrap = await getAuthenticatedProductBootstrap({
    id: user.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.fullName ?? null,
    displayName: profile.displayName ?? null,
    complianceStatus: profile.complianceStatus ?? null,
    role,
  });

  return <ProductBootstrapProvider initial={bootstrap}>
    <Link href="#app-workspace" className="app-skip-link">Skip to application workspace</Link>
    <AppShell
      brandDescriptor="Capital operating environment"
      brandTone="teal"
      sidebar={<Sidebar items={navItems} />}
      sidebarFooter={<Sidebar items={secondaryItems} />}
      header={<WorkspaceTitle />}
      utility={profileMenu}
      mobileNav={<ProductMobileNavigation items={mobilePrimaryItems} profile={profileMenu} />}
    >
      <div id="app-workspace" tabIndex={-1}>{children}</div>
    </AppShell>
  </ProductBootstrapProvider>;
}
