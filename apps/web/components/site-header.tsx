'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type NavLink = { label: string; href?: string; description?: string };
type NavSection = {
  label: string;
  overview?: NavLink;
  description: string;
  links: readonly NavLink[];
  featured?: boolean;
};

const navigation: readonly NavSection[] = [
  {
    label: 'Platform',
    featured: true,
    overview: {
      label: 'Platform Overview',
      href: '/platform',
      description: 'One operating environment for modern digital capital.',
    },
    description: 'Portfolio context, account infrastructure, treasury and allocation.',
    links: [
      {
        label: 'Portfolio Intelligence',
        href: '/portfolio-intelligence',
        description: 'Holdings, composition and portfolio structure in one view.',
      },
      {
        label: 'Capital Account',
        href: '/capital-account',
        description: 'Governed infrastructure for supported digital capital.',
      },
      {
        label: 'Treasury',
        href: '/treasury',
        description: 'Visibility into liquidity, reserves and treasury positioning.',
      },
      {
        label: 'Allocation',
        href: '/allocation',
        description: 'Observe, model and review capital positioning against objectives and policy.',
      },
    ],
  },
  {
    label: 'Solutions',
    description: 'Capital infrastructure for distinct operating needs.',
    links: [
      { label: 'Capital Organization', href: '/platform' },
      { label: 'Portfolio Oversight', href: '/portfolio-intelligence' },
      { label: 'Treasury Management', href: '/treasury' },
      { label: 'Allocation Planning', href: '/allocation' },
      { label: 'Digital Asset Operations', href: '/capital-account' },
    ],
  },
  {
    label: 'Resources',
    description: 'Research, learning and operating foundations.',
    links: [
      { label: 'Research & Perspectives', href: '/research' },
      { label: 'Learn', href: '/learn' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    label: 'Company',
    description: 'Purpose, principles and company information.',
    links: [
      { label: 'About Neptlium', href: '/about' },
      { label: 'Principles', href: '/company#principles' },
      { label: 'Security', href: '/security' },
      { label: 'Contact', href: '/contact' },
    ],
  },
] as const;

const routeIsCurrent = (path: string, href?: string) => href?.split('#')[0] === path;

function NavItem({ link, path }: { link: NavLink; path: string }) {
  const content = (
    <>
      <strong>{link.label}</strong>
      {link.description && <small>{link.description}</small>}
    </>
  );

  return link.href ? (
    <Link aria-current={routeIsCurrent(path, link.href) ? 'page' : undefined} href={link.href}>
      {content}
    </Link>
  ) : (
    <span className="nav-unavailable" aria-disabled="true">
      {content}
    </span>
  );
}

function DesktopMenu({ item, path }: { item: (typeof navigation)[number]; path: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active =
    routeIsCurrent(path, item.overview?.href) ||
    item.links.some((link) => routeIsCurrent(path, link.href));

  useEffect(() => setOpen(false), [path]);
  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
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
      onMouseEnter={() => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(true), 90);
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <button
        ref={trigger}
        className={active ? 'active' : ''}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() =>
            root.current?.querySelector<HTMLAnchorElement>('.mega-menu a')?.focus(),
          );
        }}
      >
        {item.label}
        <ChevronDown aria-hidden="true" />
      </button>
      <div
        className={`mega-menu ${item.featured ? 'mega-menu-platform' : ''}`}
        data-open={open}
        id={id}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="mega-menu-intro">
          <span className="mega-menu-kicker">{item.label}</span>
          <p>{item.description}</p>
        </div>
        <div className="mega-menu-links">
          {item.overview?.href && (
            <Link className="mega-menu-overview" href={item.overview.href}>
              <span>
                <strong>{item.overview.label}</strong>
                <small>{item.overview.description}</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          )}
          <div className="mega-menu-list">
            {item.links.map((link) => (
              <NavItem key={link.label} link={link} path={path} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(scrollY > 12);
    update();
    addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const nodes = document
        .querySelector('#mobile-nav')
        ?.querySelectorAll<HTMLElement>('a,button,summary');
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
    };
    addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previousOverflow;
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
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden="true" />
          <span>Menu</span>
        </button>
      </div>
      {open && (
        <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label="Navigation">
          <aside id="mobile-nav" className="drawer">
            <div className="drawer-head">
              <Brand />
              <button
                ref={closeButton}
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile">
              {navigation.map((item) => (
                <details className="drawer-group" key={item.label}>
                  <summary>
                    {item.label}
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="drawer-links">
                    {item.overview && <NavItem link={item.overview} path={path} />}
                    {item.links.map((link) => (
                      <NavItem key={link.label} link={link} path={path} />
                    ))}
                  </div>
                </details>
              ))}
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
