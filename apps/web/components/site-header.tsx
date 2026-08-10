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
  label: 'Platform' | 'Solutions' | 'Infrastructure' | 'Company';
  eyebrow: string;
  description: string;
  links: readonly NavLink[];
  lifecycle?: readonly string[];
};

const navigation: readonly NavSection[] = [
  {
    label: 'Platform',
    eyebrow: 'Capital operations',
    description: 'The operating surfaces that organize capital position, liquidity and governed decisions.',
    links: [
      { label: 'Capital Account', href: '/capital-account', description: 'Controlled capital state, availability and activity.' },
      { label: 'Portfolio', href: '/portfolio-intelligence', description: 'Positions and exposure in one coherent view.' },
      { label: 'Treasury', href: '/treasury', description: 'Liquidity, reserves and governed capital movement.' },
      { label: 'Allocation', href: '/allocation', description: 'Observe, model and authorize capital distribution.' },
      { label: 'Capital Activity', href: '/capital-activity', description: 'A truthful record of capital operations as they become available.' },
    ],
    lifecycle: ['Observe', 'Model', 'Authorize', 'Execute', 'Reconcile'],
  },
  {
    label: 'Solutions',
    eyebrow: 'Operating outcomes',
    description: 'Capital infrastructure organized around the work it is designed to support.',
    links: [
      { label: 'Capital Management', href: '/platform', description: 'Bring capital position and operating context into one system.' },
      { label: 'Treasury Operations', href: '/treasury', description: 'Govern liquidity, funding state and capital movement.' },
      { label: 'Allocation Governance', href: '/allocation', description: 'Move from observed exposure to policy-backed decisions.' },
      { label: 'Digital Asset Infrastructure', href: '/capital-account', description: 'Operate supported digital-capital workflows behind explicit controls.' },
    ],
  },
  {
    label: 'Infrastructure',
    eyebrow: 'Control plane',
    description: 'Provider evidence, ledger architecture and reconciliation remain separated from customer interaction.',
    links: [
      { label: 'API Infrastructure', href: '/platform', description: 'The privileged boundary for capital operations and provider orchestration.' },
      { label: 'Provider Connectivity', href: '/neptlium-link', description: 'Connectivity architecture for external capital infrastructure.' },
      { label: 'Ledger & Reconciliation', description: 'Canonical financial-history and discrepancy-resolution architecture.', status: 'Architecture' },
      { label: 'Security & Governance', href: '/security', description: 'Identity, authorization, ownership and operational controls.' },
    ],
  },
  {
    label: 'Company',
    eyebrow: 'Neptlium',
    description: 'Purpose, principles and company information.',
    links: [
      { label: 'About', href: '/about', description: 'The mission and operating thesis behind Neptlium.' },
      { label: 'Principles', href: '/company#principles', description: 'The principles governing capital operations and product truth.' },
      { label: 'Security', href: '/security', description: 'How access, authorization and operational control are approached.' },
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
                <span>Capital operations</span>
                <strong>One system. Explicit state.</strong>
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
                  Neptlium distinguishes current product capability from architectural direction
                  and unavailable execution.
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
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button command-primary-action" href={SITE.accessUrl}>
            Access Neptlium <ArrowRight aria-hidden="true" />
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
              <a href={SITE.signInUrl}>Sign in</a>
              <a className="button" href={SITE.accessUrl}>
                Access Neptlium <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
