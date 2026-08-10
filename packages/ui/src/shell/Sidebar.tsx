"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../components/utils/cn";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: ReactNode;
  /** Optional group heading. Items with the same group value are visually grouped. */
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
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.heading ?? "__root__"}>
          {section.heading && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {section.heading}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center justify-center gap-2.5 rounded-md px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent xl:justify-start",
                    isActive
                      ? "bg-surface-2 text-text-primary before:bg-accent-primary"
                      : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                  )}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        "shrink-0",
                        isActive ? "text-accent-primary" : "text-text-muted",
                      )}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
