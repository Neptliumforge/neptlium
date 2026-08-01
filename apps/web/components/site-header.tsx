'use client';

import Link from 'next/link';
import { ChevronDown, Menu, MoveRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type MenuKey = 'platform' | 'universe' | 'company';
type Item = readonly [string, string, string];
const menus: Record<
  MenuKey,
  {
    label: string;
    href: string;
    groups: readonly [string, readonly Item[]][];
    feature: readonly [string, string, string];
  }
> = {
  platform: {
    label: 'Platform',
    href: '/platform',
    groups: [
      [
        'CAPITAL',
        [
          [
            'Overview',
            'Understand the complete Neptlium capital operating environment.',
            '/platform',
          ],
          [
            'Portfolio Intelligence',
            'See holdings, performance, liquidity, concentration and exposure as one portfolio system.',
            '/platform',
          ],
          [
            'Allocation',
            'Observe the portfolio, model possible changes and authorize capital decisions.',
            '/platform',
          ],
          [
            'Capital Account',
            'Fund, hold, transfer and deploy supported capital through one governed account.',
            '/platform',
          ],
          [
            'Treasury',
            'Organize liquidity, reserves, obligations and capital readiness.',
            '/platform',
          ],
        ],
      ],
      [
        'INSIGHT',
        [
          [
            'Performance',
            'Understand returns through assets, allocations, risks and time horizons.',
            '/platform',
          ],
          [
            'Activity',
            'Review the capital events and decisions that shaped the portfolio.',
            '/platform',
          ],
          [
            'Reports',
            'Access structured portfolio, allocation and capital-activity reporting.',
            '/platform',
          ],
        ],
      ],
    ],
    feature: [
      'Neptlium Platform',
      'One environment for the full life of capital.',
      'Connect portfolio understanding, allocation decisions, capital operations and treasury visibility through one governed architecture.',
    ],
  },
  universe: {
    label: 'Capital Universe',
    href: '/capital-universe',
    groups: [
      [
        'MARKETS',
        [
          [
            'Digital Assets',
            'Established blockchain assets and digital infrastructure.',
            '/capital-universe',
          ],
          [
            'Public Markets',
            'Companies and funds shaping technology, healthcare, industry and global commerce.',
            '/capital-universe',
          ],
          [
            'Tokenized Opportunities',
            'Eligible blockchain-based exposure to supported public, private and alternative assets.',
            '/capital-universe',
          ],
          [
            'Reserve Assets',
            'Capital positioned for liquidity, obligations and future allocation.',
            '/capital-universe',
          ],
        ],
      ],
      [
        'EVALUATION',
        [
          [
            'Asset Categories',
            'Understand opportunities by asset class and market role.',
            '/capital-universe',
          ],
          [
            'Portfolio Roles',
            'Evaluate whether an asset belongs in Reserve, Core, Growth, Opportunity or Restricted capital.',
            '/capital-universe',
          ],
          [
            'Risk and Liquidity',
            'Review concentration, liquidity, market, provider and structural considerations.',
            '/capital-universe',
          ],
          [
            'Eligibility',
            'Understand jurisdiction, account and investor requirements.',
            '/capital-universe',
          ],
        ],
      ],
    ],
    feature: [
      'Capital Universe',
      'Discover through structure, not noise.',
      'Evaluate supported opportunities according to portfolio role, liquidity, risk, eligibility and long-term capital purpose.',
    ],
  },
  company: {
    label: 'Company',
    href: '/company',
    groups: [
      [
        'COMPANY',
        [
          [
            'About Neptlium',
            'The mission, principles and long-term purpose of Neptlium.',
            '/company',
          ],
          [
            'Our Principles',
            'The disciplines guiding product design, capital organization and investor control.',
            '/company#principles',
          ],
          [
            'Leadership',
            'The governance philosophy and verified corporate representation of Neptlium.',
            '/company#leadership',
          ],
          [
            'Careers',
            'Build enduring systems for modern ownership and capital allocation.',
            '/company#careers',
          ],
          ['Contact', 'General, investor, institutional and media enquiries.', '/contact'],
        ],
      ],
      [
        'TRUST',
        [
          [
            'Security',
            'How Neptlium approaches identity, authorization and capital-operation boundaries.',
            '/security',
          ],
          [
            'Trust Center',
            'Platform controls, operational transparency and risk disclosures.',
            '/trust',
          ],
          ['Press', 'Official company announcements and media resources.', '/press'],
        ],
      ],
    ],
    feature: [
      'Neptlium',
      'Built for deliberate ownership.',
      'Neptlium brings portfolio intelligence, capital allocation, treasury visibility and governed capital operations into one institutional environment.',
    ],
  },
};

function MegaMenu({ menuKey, close }: { menuKey: MenuKey; close: () => void }) {
  const menu = menus[menuKey];
  return (
    <div
      className="mega-menu"
      id={`menu-${menuKey}`}
      role="region"
      aria-label={`${menu.label} menu`}
    >
      <div className="mega-content">
        <div className="mega-groups">
          {menu.groups.map(([title, items]) => (
            <section key={title}>
              <h3>{title}</h3>
              {items.map(([label, copy, href]) => (
                <Link href={href} key={label} onClick={close}>
                  <strong>{label}</strong>
                  <span>{copy}</span>
                </Link>
              ))}
            </section>
          ))}
        </div>
        <aside className="mega-feature">
          <span>{menu.feature[0]}</span>
          <h2>{menu.feature[1]}</h2>
          <p>{menu.feature[2]}</p>
          <Link href={menu.href} onClick={close}>
            Explore {menu.label} <MoveRight aria-hidden="true" />
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
  const triggers = useRef<Partial<Record<MenuKey, HTMLButtonElement>>>({});
  const last = useRef<MenuKey | null>(null);
  useEffect(() => {
    const fn = () => setScrolled(scrollY > 10);
    fn();
    addEventListener('scroll', fn, { passive: true });
    return () => removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    setActive(null);
    setMobileOpen(false);
  }, [path]);
  useEffect(() => {
    if (!active) return;
    const outside = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setActive(null);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(null);
        requestAnimationFrame(() => last.current && triggers.current[last.current]?.focus());
      }
    };
    addEventListener('pointerdown', outside);
    addEventListener('keydown', key);
    return () => {
      removeEventListener('pointerdown', outside);
      removeEventListener('keydown', key);
    };
  }, [active]);
  useEffect(() => {
    if (!mobileOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileClose.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      removeEventListener('keydown', key);
      mobileTrigger.current?.focus();
    };
  }, [mobileOpen]);
  return (
    <header ref={headerRef} className={`site-header ${scrolled || active ? 'scrolled' : ''}`}>
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {(['platform', 'universe'] as MenuKey[]).map((key) => (
            <button
              key={key}
              ref={(n) => {
                if (n) triggers.current[key] = n;
              }}
              aria-expanded={active === key}
              aria-controls={`menu-${key}`}
              onClick={() => {
                last.current = key;
                setActive(active === key ? null : key);
              }}
            >
              {menus[key].label}
              <ChevronDown aria-hidden="true" />
            </button>
          ))}
          <Link href="/research">Research</Link>
          <button
            ref={(n) => {
              if (n) triggers.current.company = n;
            }}
            aria-expanded={active === 'company'}
            aria-controls="menu-company"
            onClick={() => {
              last.current = 'company';
              setActive(active === 'company' ? null : 'company');
            }}
          >
            Company
            <ChevronDown aria-hidden="true" />
          </button>
          <Link href="/learn">Learn</Link>
        </nav>
        <div className="nav-actions">
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button small" href={SITE.accessUrl}>
            Access Neptlium
          </a>
        </div>
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
              {(['platform', 'universe', 'company'] as MenuKey[]).map((key) => (
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
                      {menus[key].groups
                        .flatMap(([, items]) => items)
                        .map(([label, , href]) => (
                          <Link key={label} href={href}>
                            {label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/research">Research</Link>
              <Link href="/learn">Learn</Link>
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
