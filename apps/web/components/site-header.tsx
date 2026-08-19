'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type NavSection = {
  label: 'Platform' | 'Solutions' | 'Resources' | 'Company';
  links: readonly { label: string; href: string; description: string }[];
};

const navigation: readonly NavSection[] = [
  {
    label: 'Platform',
    links: [
      {
        label: 'Platform overview',
        href: '/platform',
        description: 'The coordinated capital operating environment.',
      },
      {
        label: 'Neptlium Link',
        href: '/neptlium-link',
        description: 'Connectivity beneath governed operations.',
      },
    ],
  },
  {
    label: 'Solutions',
    links: [
      {
        label: 'Capital Account',
        href: '/capital-account',
        description: 'Capital context and controlled movement.',
      },
      { label: 'Treasury', href: '/treasury', description: 'Liquidity and operating context.' },
      {
        label: 'Allocation',
        href: '/allocation',
        description: 'Model and govern allocation intent.',
      },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Research', href: '/research', description: 'Perspectives on capital operations.' },
      { label: 'Learn', href: '/learn', description: 'Explore the Neptlium operating model.' },
      { label: 'Security', href: '/security', description: 'Security and control principles.' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About Neptlium', href: '/about', description: 'Purpose and operating thesis.' },
      { label: 'Contact', href: '/contact', description: 'Start a conversation with Neptlium.' },
    ],
  },
] as const;

function DesktopDisclosure({ item, path }: { item: NavSection; path: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
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
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() =>
            root.current?.querySelector<HTMLAnchorElement>('.concise-menu a')?.focus(),
          );
        }}
      >
        {item.label}
        <ChevronDown aria-hidden="true" />
      </button>
      <div
        className="capital-command-menu concise-menu"
        id={id}
        data-open={open}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <p>{item.label}</p>
        {item.links.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            aria-current={path === link.href ? 'page' : undefined}
          >
            <span>
              <strong>{link.label}</strong>
              <small>{link.description}</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
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
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
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
    document.addEventListener('keydown', keys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keys);
      trigger.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <header className="site-header capital-command-bar">
      <div className="nav-shell">
        <Brand tone="current" />
        <nav className="desktop-command-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <DesktopDisclosure item={item} path={path} key={item.label} />
          ))}
        </nav>
        <div className="command-actions">
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button command-primary-action" href={SITE.signInUrl}>
            Open Neptlium <ArrowRight aria-hidden="true" />
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
        <div
          className="mobile-command-wrap"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div id="mobile-command-sheet" className="mobile-command-sheet" ref={panel}>
            <div className="mobile-command-head">
              <Brand tone="current" />
              <button
                ref={close}
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav className="mobile-command-nav" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const expanded = mobileSection === item.label;
                const controls = `mobile-${item.label.toLowerCase()}`;
                return (
                  <section key={item.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={controls}
                      onClick={() => setMobileSection(expanded ? null : item.label)}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                    </button>
                    <div id={controls} hidden={!expanded}>
                      {item.links.map((link) => (
                        <Link href={link.href} key={link.href}>
                          <strong>{link.label}</strong>
                          <small>{link.description}</small>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
            </nav>
            <div className="mobile-command-actions">
              <a href={SITE.signInUrl}>Sign in</a>
              <a className="button" href={SITE.signInUrl}>
                Open Neptlium <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
