'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { NeptliumMark, type NavItem } from '@neptlium/ui';

function active(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}

export function ProductMobileNavigation({
  items,
  profile,
}: {
  readonly items: readonly NavItem[];
  readonly profile?: ReactNode;
}) {
  const pathname = usePathname();
  const title = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => active(pathname, item.href))?.label ?? 'Neptlium';

  return <>
    <div className="product-mobile-header">
      <NeptliumMark size={21} tone="teal" />
      <div><span>NEPTLIUM</span><strong>{title}</strong></div>
      <div className="product-mobile-profile">{profile}</div>
    </div>
    <nav className="product-mobile-bottom" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = active(pathname, item.href);
        return <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} className={isActive ? 'is-active' : undefined}>
          {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
          <small>{item.label}</small>
        </Link>;
      })}
    </nav>
  </>;
}
