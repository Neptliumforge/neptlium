import {
  LayoutDashboard,
  Users,
  ArrowUpRight,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowLeftRight,
  Shield,
  Zap,
  Activity,
} from "lucide-react";
import type { ReactElement } from "react";

export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly group: string;
  readonly icon: ReactElement;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    group: "Dashboard",
    icon: <LayoutDashboard className="size-4" />
  },
  {
    label: "Users",
    href: "/dashboard/users",
    group: "People",
    icon: <Users className="size-4" />
  },
  {
    label: "Withdrawals",
    href: "/dashboard/withdrawals",
    group: "Operations",
    icon: <ArrowUpRight className="size-4" />
  },
  {
    label: "Allocations",
    href: "/dashboard/allocations",
    group: "Operations",
    icon: <SlidersHorizontal className="size-4" />
  },
  {
    label: "Deposits",
    href: "/dashboard/deposits",
    group: "Operations",
    icon: <ArrowDownLeft className="size-4" />
  },
  {
    label: "Operational Visibility",
    href: "/dashboard/operations",
    group: "Operations",
    icon: <Activity className="size-4" />
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    group: "Ledger",
    icon: <ArrowLeftRight className="size-4" />
  },
  {
    label: "Security",
    href: "/dashboard/security",
    group: "Platform",
    icon: <Shield className="size-4" />
  },
  {
    label: "Capabilities",
    href: "/dashboard/capabilities",
    group: "Platform",
    icon: <Zap className="size-4" />
  }
];
