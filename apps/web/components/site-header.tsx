'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  CircleHelp,
  Contact,
  FileText,
  KeyRound,
  Landmark,
  Layers3,
  Menu,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type NavLink = {
  label: string;
  href?: string;
  description?: string;
  icon?: LucideIcon;
};

type NavSection = {
  label: string;
  eyebrow: string;
  description: string;
  overview?: NavLink;
  links: readonly NavLink[];
  featured?: boolean;
};

const navigation: readonly NavSection[] = [
  {
    label: 'Platform',
    eyebrow: 'Capital operating infrastructure',
    featured: true,
    overview: {
      label: 'Platform Overview',
      href: '/platform',
      description: 'One operating environment for modern digital capital.',
      icon: Layers3,
    },
    description: 'Understand, organize and govern digital capital through one operating environment.',
    links: [
      {
        label: 'Portfolio Intelligence',
        href: '/portfolio-intelligence',
        description: 'Understand portfolio composition and capital structure through one governed view.',
        icon: ScanSearch,
      },
      {
        label: 'Capital Account',
        href: '/capital-account',
        description: 'Infrastructure for organizing and operating supported digital capital with explicit control.',
        icon: KeyRound,
      },
      {
        label: 'Treasury',
        href: '/treasury',
        description: 'Visibility into liquidity, reserves and treasury positioning.',
        icon: Landmark,
      },
      {
        label: 'Allocation',
        href: '/allocation',
        description: 'Observe, model and review capital positioning against objectives and policy.',
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: 'Solutions',
    eyebrow: 'Operating outcomes',
    description: 'Capital infrastructure organized around the decisions and operating needs it supports.',
    links: [
      {
        label: 'Capital Organization',
        href: '/platform',
        description: 'Structure digital capital into a coherent operating view.',
        icon: Layers3,
      },
      {
        label: 'Portfolio Oversight',
        href: '/portfolio-intelligence',
        description: 'Understand portfolio positioning, composition and concentration.',
        icon: ScanSearch,
      },
      {
        label: 'Treasury Management',
        href: '/treasury',
        description: 'Maintain visibility over liquidity, reserves and treasury activity.',
        icon: Landmark,
      },
      {
        label: 'Allocation Planning',
        href: '/allocation',
        description: 'Model and review capital positioning before allocation decisions.',
        icon: SlidersHorizontal,
      },
      {
        label: 'Digital Asset Operations',
        href: '/capital-account',
        description: 'Operate supported capital workflows through controlled infrastructure.',
        icon: KeyRound,
      },
    ],
  },
  {
    label: 'Resources',
    eyebrow: 'Research and operating foundations',
    description: 'Research, learning and security guidance for the Neptlium operating model.',
    links: [
      {
        label: 'Research & Perspectives',
        href: '/research',
        description: 'Research and thinking on digital capital, allocation, treasury and infrastructure.',
        icon: FileText,
      },
      {
        label: 'Learn',
        href: '/learn',
        description: 'Understand the concepts behind modern capital operations.',
        icon: CircleHelp,
      },
      {
        label: 'Security',
        href: '/security',
        description: 'Neptlium’s approach to access, protection and operational control.',
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: 'Company',
    eyebrow: 'Neptlium',
    description: 'Purpose, principles and company information.',
    links: [
      {
        label: 'About Neptlium',
        href: '/about',
        description: 'The mission and infrastructure thesis behind Neptlium.',
        icon: Building2,
      },
      {
        label: 'Principles',
        href: '/company#principles',
        description: 'The operating principles behind governed capital infrastructure.',
        icon: Sparkles,
      },
      {
        label: 'Security',
        href: '/security',
        description: 'Our approach to security, access and operational integrity.',
        icon: ShieldCheck,
      },
      {
        label: 'Contact',
        href: '/contact',
        description: 'Company, product and general inquiries.',
        icon: Contact,
      },
    ],
  },
] as const;

const routeIsCurrent = (path: string, href?: string) => href?.split('#')[0] === path;

function NavItem({ link, path }: { link: NavLink; path: string }) {
  const Icon = link.icon;
  const content = (
    <>
      {Icon && (
        <span className="mega-item-icon" aria-hidden="true">
          <Icon />
        </span>
      )}
      <span className="mega-item-copy">
        <strong>{link.label}</strong>
        {link.description && <small>{link.description}</small>}
      </span>
      {link.href && <ArrowUpRight className="mega-item-arrow" aria-hidden="true" />}
    </>
  );

  return link.href ? (
    <Link className="mega-item" aria-current={routeIsCurrent(path, link.href) ? 'page' : undefined} href={link.href}>
      {content}
    </Link>
  ) : (
    <span className="mega-item nav-unavailable" aria-disabled="true">
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
  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    },
    [],
  );
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
        hoverTimer.current = setTimeout(() => setOpen(true), 80);
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(false), 150);
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
        className={`mega-menu mega-menu-${item.label.toLowerCase()} ${item.featured ? 'mega-menu-platform' : ''}`}
        data-open={open}
        id={id}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="mega-menu-plane">
          <div className="mega-menu-intro">
            <span className="mega-menu-kicker">{item.eyebrow}</span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            {item.overview?.href && (
              <Link className="mega-menu-overview" href={item.overview.href}>
                <span>
                  <strong>{item.overview.label}</strong>
                  <small>{item.overview.description}</small>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="mega-menu-links">
            <span className="mega-menu-column-label">
              {item.featured ? 'Core systems' : item.label === 'Resources' ? 'Explore' : 'Capabilities'}
            </span>
            <div className="mega-menu-list">
              {item.links.map((link) => (
                <NavItem key={link.label} link={link} path={path} />
              ))}
            </div>
          </div>
        </div>

        <div className="mega-menu-footer">
          <span>Neptlium · Capital operating infrastructure</span>
          {item.overview?.href ? (
            <Link href={item.overview.href}>
              Explore {item.label.toLowerCase()} <ArrowRight aria-hidden="true" />
            </Link>
          ) : (
            <Link href="/platform">
              Explore Neptlium <ArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const path = usePathname();
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLElement>(null);

  const activeMobileSection = navigation.find((item) => item.label === mobileSection) ?? null;

  useEffect(() => {
    const update = () => setScrolled(scrollY > 12);
    update();
    addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileSection(null);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileSection) {
          setMobileSection(null);
        } else {
          setOpen(false);
        }
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = mobilePanel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
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
  }, [open, mobileSection]);

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
            Open Neptlium
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
          <aside id="mobile-nav" className="drawer" ref={mobilePanel}>
            <div className="drawer-head">
              <Brand />
              <button
                ref={closeButton}
                className="drawer-close"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <div className="drawer-stage" data-detail={mobileSection ? 'true' : 'false'}>
              {!activeMobileSection ? (
                <nav className="drawer-root" aria-label="Mobile">
                  <div className="drawer-root-intro">
                    <span>Neptlium</span>
                    <p>Capital operating infrastructure for modern digital capital.</p>
                  </div>
                  <div className="drawer-section-list">
                    {navigation.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMobileSection(item.label)}
                      >
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <ArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </nav>
              ) : (
                <nav className="drawer-detail" aria-label={`${activeMobileSection.label} navigation`}>
                  <button
                    className="drawer-back"
                    type="button"
                    onClick={() => setMobileSection(null)}
                  >
                    <ArrowLeft aria-hidden="true" />
                    Back
                  </button>

                  <div className="drawer-detail-head">
                    <span>{activeMobileSection.eyebrow}</span>
                    <h2>{activeMobileSection.label}</h2>
                    <p>{activeMobileSection.description}</p>
                  </div>

                  <div className="drawer-detail-links">
                    {activeMobileSection.overview && (
                      <NavItem link={activeMobileSection.overview} path={path} />
                    )}
                    {activeMobileSection.links.map((link) => (
                      <NavItem key={link.label} link={link} path={path} />
                    ))}
                  </div>
                </nav>
              )}
            </div>

            <div className="drawer-actions">
              <a href={SITE.signInUrl}>Sign in</a>
              <a className="button" href={SITE.accessUrl}>
                Open Neptlium <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
