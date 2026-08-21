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
  {
    label: 'Overview',
    href: '/dashboard',
    minRole: 'user',
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: 'Portfolio',
    href: '/dashboard/portfolio',
    minRole: 'user',
    icon: <Briefcase className="size-4" />,
  },
  {
    label: 'Capital Account',
    href: '/dashboard/wallet',
    minRole: 'user',
    icon: <Wallet className="size-4" />,
  },
  {
    label: 'Treasury',
    href: '/dashboard/treasury',
    minRole: 'user',
    icon: <Landmark className="size-4" />,
  },
  {
    label: 'Allocation',
    href: '/dashboard/allocations',
    minRole: 'user',
    icon: <SlidersHorizontal className="size-4" />,
  },
];

export const dashboardMobilePrimaryNavItems: readonly RoleAwareNavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    minRole: 'user',
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: 'Portfolio',
    href: '/dashboard/portfolio',
    minRole: 'user',
    icon: <Briefcase className="size-4" />,
  },
  {
    label: 'Capital Account',
    href: '/dashboard/wallet',
    minRole: 'user',
    icon: <Wallet className="size-4" />,
  },
  {
    label: 'Treasury',
    href: '/dashboard/treasury',
    minRole: 'user',
    icon: <Landmark className="size-4" />,
  },
  {
    label: 'Allocation',
    href: '/dashboard/allocations',
    minRole: 'user',
    icon: <SlidersHorizontal className="size-4" />,
  },
];

export const dashboardMobileSecondaryNavItems: readonly RoleAwareNavItem[] = [
  {
    label: 'Activity',
    href: '/dashboard/transactions',
    minRole: 'user',
    icon: <List className="size-4" />,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    minRole: 'user',
    icon: <Bell className="size-4" />,
  },
  {
    label: 'Documents',
    href: '/dashboard/documents',
    minRole: 'user',
    icon: <FileText className="size-4" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    minRole: 'user',
    icon: <Settings className="size-4" />,
  },
];
