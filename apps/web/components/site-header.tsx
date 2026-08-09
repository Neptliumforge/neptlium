'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const navigation = [
  {
    label: 'Platform',
    overview: { label: 'Platform overview', href: '/platform' },
    description: 'One governed environment for organizing and operating digital capital.',
    groups: [
      {
        label: 'Operating environment',
        links: [
          [
            'Portfolio Intelligence',
            '/portfolio-intelligence',
            'Understand holdings, exposure and capital position.',
          ],
          [
            'Capital Account',
            '/capital-account',
            'Infrastructure for digital capital and connected custody activity.',
          ],
          ['Treasury', '/treasury', 'Liquidity, reserves, readiness and treasury position.'],
        ],
      },
      {
        label: 'Control and connectivity',
        links: [
          ['Allocation', '/allocation', 'Observe, model and govern allocation decisions.'],
          [
            'Capital Activity',
            '/capital-activity',
            'Operational records where connected data is available.',
          ],
          ['Neptlium Link', '/neptlium-link', 'Connectivity infrastructure for digital capital.'],
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    overview: { label: 'Capital visibility', href: '/portfolio-intelligence' },
    description: 'Operating architecture organized around institutional capital needs.',
    groups: [
      {
        label: 'Capital operations',
        links: [
          [
            'Capital Visibility',
            '/portfolio-intelligence',
            'Create a unified view of connected digital capital.',
          ],
          ['Treasury Operations', '/treasury', 'Understand liquidity, reserves and readiness.'],
          ['Allocation Governance', '/allocation', 'Model decisions through controlled workflows.'],
        ],
      },
      {
        label: 'Infrastructure',
        links: [
          [
            'Digital Asset Operations',
            '/capital-account',
            'Coordinate supported activity in a governed environment.',
          ],
          [
            'Institutional Connectivity',
            '/neptlium-link',
            'Connect provider infrastructure through Neptlium Link.',
          ],
          ['Security Architecture', '/security', 'Review controls and infrastructure boundaries.'],
        ],
      },
    ],
  },
  {
    label: 'Resources',
    overview: { label: 'Research and perspectives', href: '/research' },
    description: 'Documentation, security principles and operating perspectives.',
    groups: [
      {
        label: 'Knowledge',
        links: [
          ['Documentation', '/learn', 'Platform and integration foundations.'],
          ['Security', '/security', 'Security architecture and operating controls.'],
          [
            'Capital Framework',
            '/research',
            'How Neptlium approaches digital-capital organization.',
          ],
        ],
      },
      {
        label: 'Neptlium',
        links: [
          ['Insights', '/research', 'Research and operating perspectives.'],
          ['Trust', '/trust', 'Product boundaries stated without ambiguity.'],
          ['Contact', '/contact', 'Institutional and platform inquiries.'],
        ],
      },
    ],
  },
] as const;

const isCurrent = (path: string, href: string) => path === href;

function DesktopMenu({ item, path }: { item: (typeof navigation)[number]; path: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const active =
    item.overview.href === path ||
    item.groups.some((group) => group.links.some(([, href]) => href === path));

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      className="nav-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={active ? 'active' : ''}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>('a')?.focus());
        }}
        onMouseEnter={() => setOpen(true)}
      >
        {item.label}
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div className="mega-menu" id={id}>
          <div className="mega-menu-intro">
            <span className="mega-menu-kicker">{item.label}</span>
            <p>{item.description}</p>
            <Link href={item.overview.href}>
              {item.overview.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="mega-menu-groups">
            {item.groups.map((group) => (
              <div className="mega-menu-group" key={group.label}>
                <span>{group.label}</span>
                {group.links.map(([label, href, description]) => (
                  <Link
                    aria-current={isCurrent(path, href) ? 'page' : undefined}
                    href={href}
                    key={href}
                  >
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(scrollY > 12);
    update();
    addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const panel = document.querySelector('#mobile-nav');
        const nodes = panel?.querySelectorAll<HTMLElement>('a,button');
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      removeEventListener('keydown', key);
      mobileTrigger.current?.focus();
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary">
          {navigation.map((item) => (
            <DesktopMenu item={item} path={path} key={item.label} />
          ))}
          <Link
            className={path === '/company' ? 'active nav-direct' : 'nav-direct'}
            aria-current={path === '/company' ? 'page' : undefined}
            href="/company"
          >
            Company
          </Link>
        </nav>
        <div className="nav-actions">
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button small" href={SITE.accessUrl}>
            Get started
          </a>
        </div>
        <button
          ref={mobileTrigger}
          className="menu-trigger"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            className="drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside id="mobile-nav" className="drawer">
            <div className="drawer-head">
              <Brand />
              <button ref={close} aria-label="Close menu" onClick={() => setOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile">
              {navigation.map((item) => (
                <div className="drawer-group" key={item.label}>
                  <span>{item.label}</span>
                  <Link href={item.overview.href}>{item.overview.label}</Link>
                  {item.groups.map((group) => (
                    <div className="drawer-links" key={group.label}>
                      {group.links.map(([label, href]) => (
                        <Link
                          aria-current={path === href ? 'page' : undefined}
                          href={href}
                          key={href}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              <div className="drawer-group">
                <span>Company</span>
                <Link href="/company">Company</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </nav>
            <div className="drawer-actions">
              <a href={SITE.signInUrl}>Sign in</a>
              <a className="button" href={SITE.accessUrl}>
                Get started
              </a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
