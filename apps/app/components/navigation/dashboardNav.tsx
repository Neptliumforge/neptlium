import {
  Activity,
  BookOpen,
  Briefcase,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { Role } from "@netlium/lib";
import type { NavItem } from "@netlium/ui";

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    minRole: "user",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    minRole: "user",
    icon: <Briefcase className="size-4" />,
  },
  {
    label: "Allocation",
    href: "/dashboard/allocations",
    minRole: "user",
    icon: <SlidersHorizontal className="size-4" />,
  },
  {
    label: "Capital Health",
    href: "/dashboard/risk",
    minRole: "user",
    icon: <Gauge className="size-4" />,
  },
  {
    label: "Capital Activity",
    href: "/dashboard/transactions",
    minRole: "user",
    icon: <Activity className="size-4" />,
  },
  {
    label: "Research",
    href: "/dashboard/research",
    minRole: "user",
    icon: <BookOpen className="size-4" />,
  },
  {
    label: "Security",
    href: "/dashboard/settings",
    minRole: "user",
    icon: <ShieldCheck className="size-4" />,
  },
];
