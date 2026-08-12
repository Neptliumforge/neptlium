'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type NavLink = {
  label: string;
  href?: string;
  description: string;
  status?: 'Architecture' | 'In development';
};

type NavSection = {
  label: 'Platform' | 'Capital' | 'Connectivity' | 'Governance' | 'Company';
  eyebrow: string;
  description: string;
  links: readonly NavLink[];
  lifecycle?: readonly string[];
};

const navigation: readonly NavSection[] = [
  {
    label: 'Platform',
    eyebrow: 'Capital operating system',
    description: 'One controlled environment for understanding capital state and directing what comes next.',
    links: [
      { label: 'Platform overview', href: '/platform', description: 'How Neptlium organizes digital capital as one operating system.' },
      { label: 'Portfolio', href: '/portfolio-intelligence', description: 'Ownership, exposure, concentration and liquidity in one coherent view.' },
      { label: 'Capital Account', href: '/capital-account', description: 'The governed operating boundary for capital movement.' },
      { label: 'Treasury', href: '/treasury', description: 'Liquidity, reserves and capital readiness under explicit controls.' },
      { label: 'Allocation', href: '/allocation', description: 'Observe, model and authorize capital distribution.' },
    ],
    lifecycle: ['Observe', 'Model', 'Authorize'],
  },
  {
    label: 'Capital',
    eyebrow: 'Capital structure',
    description: 'The public model for capital position, operating activity and policy-backed decisions.',
    links: [
      { label: 'Capital Universe', href: '/capital-universe', description: 'The supported and directional capital model without fabricated capability.' },
      { label: 'Capital Activity', href: '/capital-activity', description: 'A truthful record of capital operations as they become available.' },
      { label: 'Treasury', href: '/treasury', description: 'Reserve structure, liquidity and operating capacity.' },
      { label: 'Allocation', href: '/allocation', description: 'Policy, classification and governed authorization.' },
    ],
  },
  {
    label: 'Connectivity',
    eyebrow: 'Neptlium Link',
    description: 'Connectivity architecture for external digital-capital infrastructure.',
    links: [
      { label: 'Neptlium Link', href: '/neptlium-link', description: 'Institutional connectivity infrastructure for digital capital.' },
      { label: 'Provider connectivity', description: 'Provider isolation and orchestration architecture.', status: 'Architecture' },
      { label: 'Network connectivity', description: 'Network-facing infrastructure governed behind the API boundary.', status: 'Architecture' },
      { label: 'API infrastructure', href: '/platform', description: 'The privileged boundary for governed capital operations.' },
    ],
  },
  {
    label: 'Governance',
    eyebrow: 'Control architecture',
    description: 'Identity, authorization, policy and operational state remain explicit throughout the system.',
    links: [
      { label: 'Security', href: '/security', description: 'Identity, permission boundaries and operational controls.' },
      { label: 'Trust', href: '/trust', description: 'How Neptlium communicates system truth and operating boundaries.' },
      { label: 'Risk disclosure', href: '/risk-disclosure', description: 'Public risk and availability disclosures.' },
    ],
  },
  {
    label: 'Company',
    eyebrow: 'Neptlium',
    description: 'Purpose, principles and company information.',
    links: [
      { label: 'About', href: '/about', description: 'The mission and operating thesis behind Neptlium.' },
      { label: 'Principles', href: '/company#principles', description: 'The principles governing capital operations and product truth.' },
      { label: 'Contact', href: '/contact', description: 'Company, product and general inquiries.' },
    ],
  },
] as const;

const routeIsCurrent = (path: string, href?: string) => href?.split('#')[0] === path;

function MenuLink({ link, path }: { link: NavLink; path: string }) {
  const content = (
    <>
      <span className="command-link-copy">
        <strong>{link.label}</strong>
        <small>{link.description}</small>
      </span>
      {link.status ? <span className="command-status">{link.status}</span> : <ArrowRight aria-hidden="true" />}
    </>
  );

  return link.href ? (
    <Link className="command-link" href={link.href} aria-current={routeIsCurrent(path, link.href) ? 'page' : undefined}>
      {content}
    </Link>
  ) : (
    <span className="command-link is-architectural" aria-disabled="true">
      {content}
    </span>
  );
}

function DesktopCommandMenu({ item, path }: { item: NavSection; path: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = item.links.some((link) => routeIsCurrent(path, link.href));

  useEffect(() => setOpen(false), [path]);

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
      className="command-menu-root"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
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
            root.current?.querySelector<HTMLAnchorElement>('.capital-command-menu a')?.focus(),
          );
        }}
      >
        {item.label}
        <ChevronDown aria-hidden="true" />
      </button>

      <div
        className="capital-command-menu"
        id={id}
        data-open={open}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="capital-command-inner">
          <div className="command-intro">
            <span>{item.eyebrow}</span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
          </div>

          <div className="command-links">
            {item.links.map((link) => (
              <MenuLink link={link} path={path} key={link.label} />
            ))}
          </div>

          <aside className="command-system-panel">
            {item.lifecycle ? (
              <>
                <span>Allocation lifecycle</span>
                <strong>Observed before modeled. Authorized before operation.</strong>
                <ol>
                  {item.lifecycle.map((state, index) => (
                    <li key={state}>
                      <i>{String(index + 1).padStart(2, '0')}</i>
                      <span>{state}</span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <span>{item.eyebrow}</span>
                <strong>Capability follows verified architecture.</strong>
                <p>
                  Neptlium distinguishes current capability from architectural direction and
                  unavailable execution.
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSection(null);
  }, [path]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
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

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <header className="site-header capital-command-bar">
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-command-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <DesktopCommandMenu item={item} path={path} key={item.label} />
          ))}
        </nav>

        <div className="command-actions">
          <Link href="/platform">Explore</Link>
          <a className="button command-primary-action" href={SITE.signInUrl}>
            Enter App <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <button
          ref={trigger}
          className="command-mobile-trigger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-command-sheet"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-command-wrap" role="dialog" aria-modal="true" aria-label="Navigation">
          <div id="mobile-command-sheet" className="mobile-command-sheet" ref={panel}>
            <div className="mobile-command-head">
              <Brand />
              <button ref={close} aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </div>

            <nav className="mobile-command-nav" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const expanded = mobileSection === item.label;
                return (
                  <section key={item.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setMobileSection(expanded ? null : item.label)}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                    </button>
                    {expanded && (
                      <div className="mobile-command-links">
                        {item.links.map((link) => (
                          <MenuLink link={link} path={path} key={link.label} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </nav>

            <div className="mobile-command-actions">
              <Link href="/platform">Explore</Link>
              <a className="button" href={SITE.signInUrl}>
                Enter App <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
