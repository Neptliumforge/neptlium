'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { NAVIGATION } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';

type NavSection = (typeof NAVIGATION)[number];

function pathBelongsTo(path: string, item: NavSection) {
  return path === item.href || path.startsWith(`${item.href}/`);
}

function DesktopDisclosure({ item, path }: { item: NavSection; path: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hasDisclosure = item.links.length > 1 || item.links[0]?.href !== item.href;

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

  if (!hasDisclosure) {
    return (
      <Link className="desktop-domain-link" href={item.href} aria-current={path === item.href ? 'page' : undefined}>
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="command-menu-root"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="desktop-domain-control" data-active={pathBelongsTo(path, item)}>
        <Link href={item.href} aria-current={path === item.href ? 'page' : undefined}>
          {item.label}
        </Link>
        <button
          ref={trigger}
          aria-expanded={open}
          aria-controls={id}
          aria-haspopup="true"
          aria-label={`Show ${item.label} navigation`}
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
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
      <div
        className="capital-command-menu concise-menu"
        id={id}
        data-open={open}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <Link className="menu-domain-overview" href={item.href}>
          <span>
            <strong>{item.label}</strong>
            <small>{item.description}</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
        {item.links
          .filter((link) => link.href !== item.href)
          .map((link) => (
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
          {NAVIGATION.map((item) => (
            <DesktopDisclosure item={item} path={path} key={item.label} />
          ))}
        </nav>
        <div className="command-actions">
          <Link href="/products">Products</Link>
          <Link className="button command-primary-action" href={SITE.publicAccessUrl}>
            {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
          </Link>
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
              <Brand tone="current" />
              <button ref={close} aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </div>
            <nav className="mobile-command-nav" aria-label="Mobile navigation">
              {NAVIGATION.map((item) => {
                const expandable = item.links.length > 1 || item.links[0]?.href !== item.href;
                const expanded = mobileSection === item.label;
                const controls = `mobile-${item.label.toLowerCase()}`;
                return (
                  <section key={item.label}>
                    <div className="mobile-domain-row">
                      <Link href={item.href}>{item.label}</Link>
                      {expandable ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={controls}
                          aria-label={`${expanded ? 'Hide' : 'Show'} ${item.label} links`}
                          onClick={() => setMobileSection(expanded ? null : item.label)}
                        >
                          <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                        </button>
                      ) : null}
                    </div>
                    {expandable ? (
                      <div id={controls} hidden={!expanded} className="mobile-domain-children">
                        {item.links
                          .filter((link) => link.href !== item.href)
                          .map((link) => (
                            <Link href={link.href} key={link.href}>
                              <strong>{link.label}</strong>
                              <small>{link.description}</small>
                            </Link>
                          ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </nav>
            <div className="mobile-command-actions">
              <Link className="button" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/platform">Explore platform</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
