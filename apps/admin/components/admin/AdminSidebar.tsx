"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@neptlium/ui";
import type { AdminNavItem } from "@/components/navigation/adminNav";

export function AdminSidebar({ items }: { readonly items: AdminNavItem[] }) {
  const pathname = usePathname();

  // Group items
  const groups = items.reduce<Record<string, AdminNavItem[]>>((acc, item) => {
    const group = acc[item.group] ?? [];
    group.push(item);
    acc[item.group] = group;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([groupLabel, groupItems]) => (
        <div key={groupLabel}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            {groupLabel}
          </p>
          <ul className="space-y-0.5">
            {groupItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-[color:var(--color-surface-1)] text-text-primary"
                        : "text-text-muted hover:bg-[color:var(--color-surface-1)]/60 hover:text-text-secondary"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isActive ? "text-accent-primary" : "text-text-muted"
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
