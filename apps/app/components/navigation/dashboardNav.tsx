import {
  Bell,
  Briefcase,
  FileText,
  Landmark,
  LayoutDashboard,
  List,
  Settings,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import type { Role } from '@neptlium/lib/rbac';
import type { NavItem } from '@neptlium/ui';

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Overview', href: '/dashboard', minRole: 'user', group: 'Overview', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Capital Account', href: '/dashboard/wallet', minRole: 'user', group: 'Capital', icon: <Wallet className="size-4" /> },
  { label: 'Treasury', href: '/dashboard/treasury', minRole: 'user', group: 'Capital', icon: <Landmark className="size-4" /> },
  { label: 'Allocation', href: '/dashboard/allocations', minRole: 'user', group: 'Investment context', icon: <SlidersHorizontal className="size-4" /> },
  { label: 'Portfolio Intelligence', href: '/dashboard/portfolio', minRole: 'user', group: 'Investment context', icon: <Briefcase className="size-4" /> },
];

export const dashboardMobilePrimaryNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Overview', href: '/dashboard', minRole: 'user', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Capital Account', href: '/dashboard/wallet', minRole: 'user', icon: <Wallet className="size-4" /> },
  { label: 'Treasury', href: '/dashboard/treasury', minRole: 'user', icon: <Landmark className="size-4" /> },
  { label: 'Allocation', href: '/dashboard/allocations', minRole: 'user', icon: <SlidersHorizontal className="size-4" /> },
  { label: 'Portfolio Intelligence', href: '/dashboard/portfolio', minRole: 'user', icon: <Briefcase className="size-4" /> },
];

export const dashboardSecondaryNavItems: readonly RoleAwareNavItem[] = [
  { label: 'Activity', href: '/dashboard/transactions', minRole: 'user', group: 'Records', icon: <List className="size-4" /> },
  { label: 'Documents', href: '/dashboard/documents', minRole: 'user', group: 'Records', icon: <FileText className="size-4" /> },
  { label: 'Notifications', href: '/dashboard/notifications', minRole: 'user', group: 'Workspace', icon: <Bell className="size-4" /> },
  { label: 'Settings', href: '/dashboard/settings', minRole: 'user', group: 'Workspace', icon: <Settings className="size-4" /> },
];

export const dashboardMobileSecondaryNavItems = dashboardSecondaryNavItems;
