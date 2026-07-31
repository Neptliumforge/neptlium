'use client';

import Link from 'next/link';
import { ChevronDown, Menu, MoveRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type MenuKey = 'platform' | 'universe' | 'intelligence' | 'company' | 'learn';

const menus = {
  platform: {
    label: 'Platform',
    href: '/platform',
    items: [
      ['Overview', 'Understand Neptlium’s complete capital operating environment.'],
      [
        'Portfolio Intelligence',
        'See holdings, performance, liquidity, concentration and capital activity as one system.',
      ],
      [
        'Allocation',
        'Observe the current portfolio, model possible changes and prepare governed authorization.',
      ],
      [
        'Capital Account',
        'Account infrastructure for supported capital, governed by explicit boundaries.',
      ],
      ['Treasury', 'Organize liquidity, reserves, obligations and capital readiness.'],
      ['Activity', 'Review capital activity and operational events in context.'],
    ],
    feature: [
      'One environment for the life of capital.',
      'Connect portfolio understanding, allocation decisions and capital operations through one governed architecture.',
      'Explore the platform',
    ],
  },
  universe: {
    label: 'Capital Universe',
    href: '/capital-universe',
    groups: [
      ['Digital Assets', ['Bitcoin', 'Ether', 'Stablecoins', 'Blockchain Infrastructure']],
      [
        'Public Markets',
        ['Artificial Intelligence', 'Technology', 'Healthcare', 'Industry', 'Global Commerce'],
      ],
      [
        'Tokenized Opportunities',
        [
          'Public-market exposure',
          'Private-market structures',
          'Alternative assets',
          'Eligibility-dependent instruments',
        ],
      ],
      ['Reserve Assets', ['Liquidity assets', 'Stable-value instruments', 'Capital reserves']],
    ],
    feature: [
      'Discover through structure, not noise.',
      'Evaluate assets according to category, portfolio role, liquidity, risk, eligibility and infrastructure status.',
      'Explore Capital Universe',
    ],
  },
  intelligence: {
    label: 'Intelligence',
    href: '/research',
    items: [
      [
        'Research',
        'Institutional analysis of markets, infrastructure, ownership systems and operational risk.',
      ],
      [
        'Portfolio Intelligence',
        'Understand contribution, concentration, liquidity, exposure and performance.',
      ],
      [
        'Reports',
        'The future reporting environment for portfolio statements, allocation reports and capital activity.',
      ],
    ],
    topics: [
      'Digital assets',
      'Public markets',
      'Artificial intelligence',
      'Capital allocation',
      'Treasury and liquidity',
      'Tokenized ownership',
      'Portfolio construction',
      'Operational risk',
    ],
    feature: ['Intelligence for long-duration decisions.', '', 'Explore Research'],
  },
  company: {
    label: 'Company',
    href: '/about',
    items: [
      [
        'About Neptlium',
        'The mission and architecture behind modern capital infrastructure.',
        '/about',
      ],
      [
        'Security',
        'How Neptlium approaches authentication, authorization, infrastructure boundaries and explicit control.',
        '/security',
      ],
      ['Contact', 'Reach the Neptlium team and support.', '/contact'],
    ],
    feature: [
      'Built around explicit control.',
      'Neptlium separates identity, infrastructure, decision-making and execution into governed product boundaries.',
      'About Neptlium',
    ],
  },
  learn: {
    label: 'Learn',
    href: '/research',
    topics: [
      'Capital allocation basics',
      'Understanding digital assets',
      'Public-market ownership',
      'Tokenized ownership',
      'Portfolio concentration',
      'Liquidity and reserve planning',
      'Long-term risk',
    ],
    feature: [
      'Build a clearer capital vocabulary.',
      'Explore learning themes through Neptlium’s developing research direction.',
      'Explore Research',
    ],
  },
} as const;

function getMobileLabels(key: MenuKey): readonly string[] {
  switch (key) {
    case 'platform':
      return menus.platform.items.map((item) => item[0]);
    case 'universe':
      return menus.universe.groups.map((group) => group[0]);
    case 'intelligence':
      return [...menus.intelligence.items.map((item) => item[0]), ...menus.intelligence.topics];
    case 'company':
      return menus.company.items.map((item) => item[0]);
    case 'learn':
      return menus.learn.topics;
  }
}

function MegaMenu({ menuKey, close }: { menuKey: MenuKey; close: () => void }) {
  const menu = menus[menuKey];
  return (
    <div
      className={`mega-menu mega-${menuKey}`}
      id={`menu-${menuKey}`}
      role="region"
      aria-label={`${menu.label} menu`}
    >
      <div className="mega-content">
        {'items' in menu && (
          <div className="mega-items">
            {menu.items.map((item) => {
              const href = item.length === 3 ? item[2] : menu.href;
              return (
                <Link href={href} key={item[0]} onClick={close}>
                  <strong>{item[0]}</strong>
                  <span>{item[1]}</span>
                </Link>
              );
            })}
          </div>
        )}
        {'groups' in menu && (
          <div className="mega-groups">
            {menu.groups.map(([title, items]) => (
              <section key={title}>
                <h3>{title}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {'topics' in menu && (
          <section className="mega-topics">
            <h3>Topics</h3>
            <ul>
              {menu.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>
        )}
        <aside className="mega-feature">
          <span>Neptlium / {menu.label}</span>
          <h2>{menu.feature[0]}</h2>
          {menu.feature[1] && <p>{menu.feature[1]}</p>}
          <Link href={menu.href} onClick={close}>
            {menu.feature[2]} <MoveRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [active, setActive] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const mobileClose = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Partial<Record<MenuKey, HTMLButtonElement>>>({});
  const lastDesktopTrigger = useRef<MenuKey | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 10);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    setActive(null);
    setMobileOpen(false);
  }, [path]);
  useEffect(() => {
    if (!active) return;
    const close = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setActive(null);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const target = lastDesktopTrigger.current;
        setActive(null);
        requestAnimationFrame(() => target && triggerRefs.current[target]?.focus());
      }
    };
    addEventListener('pointerdown', close);
    addEventListener('keydown', key);
    return () => {
      removeEventListener('pointerdown', close);
      removeEventListener('keydown', key);
    };
  }, [active]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileClose.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key !== 'Tab') return;
      const nodes = document
        .querySelector('#mobile-nav')
        ?.querySelectorAll<HTMLElement>('a,button:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
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
  }, [mobileOpen]);

  return (
    <header ref={headerRef} className={`site-header ${scrolled || active ? 'scrolled' : ''}`}>
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {(Object.keys(menus) as MenuKey[]).map((key) => (
            <button
              key={key}
              ref={(node) => {
                if (node) triggerRefs.current[key] = node;
              }}
              className={active === key ? 'active' : ''}
              aria-expanded={active === key}
              aria-controls={`menu-${key}`}
              onClick={() => {
                lastDesktopTrigger.current = key;
                setActive(active === key ? null : key);
              }}
            >
              {menus[key].label}
              <ChevronDown aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button small" href={SITE.accessUrl}>
            Access Neptlium
          </a>
        </div>
        <a className="mobile-access" href={SITE.accessUrl}>
          Access
        </a>
        <button
          ref={mobileTrigger}
          className="menu-trigger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>
      {active && <MegaMenu menuKey={active} close={() => setActive(null)} />}
      {mobileOpen && (
        <div className="drawer-wrap">
          <button
            className="drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            id="mobile-nav"
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="drawer-head">
              <Brand />
              <button
                ref={mobileClose}
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              {(Object.keys(menus) as MenuKey[]).map((key) => (
                <div className="mobile-group" key={key}>
                  <button
                    aria-expanded={mobileSection === key}
                    aria-controls={`mobile-${key}`}
                    onClick={() => setMobileSection(mobileSection === key ? null : key)}
                  >
                    {menus[key].label}
                    <ChevronDown aria-hidden="true" />
                  </button>
                  {mobileSection === key && (
                    <div id={`mobile-${key}`}>
                      <Link href={menus[key].href}>Explore {menus[key].label}</Link>
                      {getMobileLabels(key).map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="drawer-actions">
              <a href={SITE.signInUrl}>Sign in</a>
              <a className="button" href={SITE.accessUrl}>
                Access Neptlium
              </a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
