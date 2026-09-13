import {
  Bell,
  Building2,
  FileText,
  Landmark,
  LayoutDashboard,
  List,
  Settings,
  SlidersHorizontal,
  Wallet,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';
import type { Role } from '@neptlium/lib/rbac';
import type { NavItem } from '@neptlium/ui';

export interface RoleAwareNavItem extends NavItem { readonly minRole: Role; }

export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Overview', href: '/dashboard', minRole: 'user', group: 'Overview', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Capital', href: '/dashboard/capital', minRole: 'user', group: 'Capital', icon: <Wallet className="size-4" /> },
  { label: 'Treasury', href: '/dashboard/treasury', minRole: 'user', group: 'Capital', icon: <Landmark className="size-4" /> },
  { label: 'Portfolio', href: '/dashboard/portfolio', minRole: 'user', group: 'Invest', icon: <Briefcase className="size-4" /> },
  { label: 'Allocation', href: '/dashboard/allocation', minRole: 'user', group: 'Invest', icon: <SlidersHorizontal className="size-4" /> },
  { label: 'Companies', href: '/dashboard/companies', minRole: 'user', group: 'Invest', icon: <Building2 className="size-4" /> },
  { label: 'Activity', href: '/dashboard/activity', minRole: 'user', group: 'Records', icon: <List className="size-4" /> },
  { label: 'Documents', href: '/dashboard/documents', minRole: 'user', group: 'Records', icon: <FileText className="size-4" /> },
  { label: 'Notifications', href: '/dashboard/notifications', minRole: 'user', group: 'Records', icon: <Bell className="size-4" /> },
];

export const dashboardSecondaryNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', minRole: 'user', group: 'Account', icon: <Settings className="size-4" /> },
];

export const dashboardMobilePrimaryNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Home', href: '/dashboard', minRole: 'user', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Capital', href: '/dashboard/capital', minRole: 'user', icon: <Wallet className="size-4" /> },
  { label: 'Portfolio', href: '/dashboard/portfolio', minRole: 'user', icon: <Briefcase className="size-4" /> },
  { label: 'Activity', href: '/dashboard/activity', minRole: 'user', icon: <List className="size-4" /> },
  { label: 'More', href: '/dashboard/settings', minRole: 'user', icon: <MoreHorizontal className="size-4" /> },
];

export const dashboardMobileSecondaryNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Treasury', href: '/dashboard/treasury', minRole: 'user', icon: <Landmark className="size-4" /> },
  { label: 'Allocation', href: '/dashboard/allocation', minRole: 'user', icon: <SlidersHorizontal className="size-4" /> },
  { label: 'Companies', href: '/dashboard/companies', minRole: 'user', icon: <Building2 className="size-4" /> },
  { label: 'Documents', href: '/dashboard/documents', minRole: 'user', icon: <FileText className="size-4" /> },
  { label: 'Notifications', href: '/dashboard/notifications', minRole: 'user', icon: <Bell className="size-4" /> },
  { label: 'Settings', href: '/dashboard/settings', minRole: 'user', icon: <Settings className="size-4" /> },
];
