'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const links = [
  ['Platform', '/platform'],
  ['Capital Universe', '/capital-universe'],
  ['Security', '/security'],
  ['Research', '/research'],
  ['Company', '/company'],
] as const;
export function SiteHeader() {
  const [open, setOpen] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const trigger = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const fn = () => setScrolled(scrollY > 12);
    fn();
    addEventListener('scroll', fn, { passive: true });
    return () => removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        const panel = document.querySelector('#mobile-nav');
        const nodes = panel?.querySelectorAll<HTMLElement>('a,button');
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [open]);
  return (
    <header className={'site-header ' + (scrolled ? 'scrolled' : '')}>
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary">
          {links.map(([label, href]) => (
            <Link
              className={path === href ? 'active' : ''}
              aria-current={path === href ? 'page' : undefined}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <a href={SITE.signInUrl}>Sign in</a>
          <a className="button small" href={SITE.accessUrl}>
            Access Neptlium
          </a>
        </div>
        <button
          ref={trigger}
          className="menu-trigger"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
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
                <X />
              </button>
            </div>
            <nav aria-label="Mobile">
              {links.map(([label, href]) => (
                <Link aria-current={path === href ? 'page' : undefined} key={href} href={href}>
                  {label}
                </Link>
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
