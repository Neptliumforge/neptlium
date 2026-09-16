import {
  Bell,
  FileText,
  Gauge,
  LayoutDashboard,
  List,
  Settings,
  Briefcase,
  MoreHorizontal,
  LifeBuoy,
  Search,
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
    group: 'Capital',
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: 'Portfolio',
    href: '/dashboard/portfolio',
    minRole: 'user',
    group: 'Capital',
    icon: <Briefcase className="size-4" />,
  },
  {
    label: 'Invest',
    href: '/dashboard/invest',
    minRole: 'user',
    group: 'Capital',
    icon: <Search className="size-4" />,
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    minRole: 'user',
    group: 'Capital',
    icon: <List className="size-4" />,
  },
  {
    label: 'More',
    href: '/dashboard/more',
    minRole: 'user',
    group: 'Capital',
    icon: <MoreHorizontal className="size-4" />,
  },
];

export const dashboardSecondaryNavItems: readonly RoleAwareNavItem[] = [
  {
    label: 'Help & Support',
    href: '/dashboard/support',
    minRole: 'user',
    group: 'Account',
    icon: <LifeBuoy className="size-4" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    minRole: 'user',
    group: 'Account',
    icon: <Settings className="size-4" />,
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
    label: 'Invest',
    href: '/dashboard/invest',
    minRole: 'user',
    icon: <Search className="size-4" />,
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    minRole: 'user',
    icon: <List className="size-4" />,
  },
  {
    label: 'More',
    href: '/dashboard/more',
    minRole: 'user',
    icon: <MoreHorizontal className="size-4" />,
  },
];

export const dashboardMobileSecondaryNavItems: readonly RoleAwareNavItem[] = [
  {
    label: 'Capital actions',
    href: '/dashboard/capital',
    minRole: 'user',
    icon: <Gauge className="size-4" />,
  },
  {
    label: 'Documents',
    href: '/dashboard/documents',
    minRole: 'user',
    icon: <FileText className="size-4" />,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    minRole: 'user',
    icon: <Bell className="size-4" />,
  },
  {
    label: 'Help & Support',
    href: '/dashboard/support',
    minRole: 'user',
    icon: <LifeBuoy className="size-4" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    minRole: 'user',
    icon: <Settings className="size-4" />,
  },
];
