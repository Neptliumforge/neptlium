import {
  Gauge,
  LayoutDashboard,
  List,
  Settings,
  Briefcase,
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
    label: 'Capital',
    href: '/dashboard/capital',
    minRole: 'user',
    group: 'Capital',
    icon: <Gauge className="size-4" />,
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    minRole: 'user',
    group: 'Capital',
    icon: <List className="size-4" />,
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
    label: 'Capital',
    href: '/dashboard/capital',
    minRole: 'user',
    icon: <Gauge className="size-4" />,
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    minRole: 'user',
    icon: <List className="size-4" />,
  },
];
