"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../components/utils/cn";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: ReactNode;
  readonly group?: string;
}

export interface SidebarProps {
  readonly items: readonly NavItem[];
}

export function Sidebar({ items }: SidebarProps): ReactElement {
  const pathname = usePathname();
  const sections: Array<{ heading: string | undefined; items: NavItem[] }> = [];
  const seenGroups = new Map<string | undefined, number>();

  for (const item of items) {
    const key = item.group;
    if (!seenGroups.has(key)) {
      seenGroups.set(key, sections.length);
      sections.push({ heading: key, items: [] });
    }
    sections[seenGroups.get(key)!]!.items.push(item);
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.heading ?? "__root__"} aria-label={section.heading}>
          {section.heading ? (
            <p className="mb-1.5 hidden px-3 text-[10px] font-medium tracking-[0.03em] text-sidebar-text-muted xl:block">
              {section.heading}
            </p>
          ) : null}
          <div className="space-y-px">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "relative flex min-h-10 items-center justify-center gap-2.5 px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-transparent xl:justify-start",
                    isActive
                      ? "text-sidebar-text-primary before:bg-sidebar-text-primary"
                      : "text-sidebar-text-secondary hover:bg-sidebar-surface-secondary hover:text-sidebar-text-primary",
                  )}
                >
                  {item.icon ? (
                    <span className={cn("shrink-0", isActive ? "text-sidebar-text-primary" : "text-sidebar-text-muted")} aria-hidden="true">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="hidden min-w-0 truncate xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
