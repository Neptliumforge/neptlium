'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { Brand } from './brand';
import { MobileNavigation } from './mobile-navigation';
import { NAVIGATION } from '@/lib/content/public-architecture';
import { PRODUCT_FAMILY_LINKS } from '@/lib/content/product-family';
import { SITE } from '@/lib/content/site';

type NavSection = (typeof NAVIGATION)[number];

function pathBelongsTo(path: string, item: NavSection) {
  return path === item.href || item.links.some((link) => path === link.href || path.startsWith(`${link.href}/`));
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
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  if (!hasDisclosure) return <Link className="desktop-domain-link" href={item.href} aria-current={path === item.href ? 'page' : undefined}>{item.label}</Link>;

  return <div className="command-menu-root" ref={root} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className="desktop-domain-control" data-active={pathBelongsTo(path, item)}>
      <Link href={item.href} aria-current={path === item.href ? 'page' : undefined}>{item.label}</Link>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} aria-haspopup="true" aria-label={`Show ${item.label} navigation`} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key !== 'ArrowDown') return; event.preventDefault(); setOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>('.concise-menu a')?.focus()); }}><ChevronDown aria-hidden="true" /></button>
    </div>
    <div className="capital-command-menu concise-menu" id={id} data-open={open} aria-hidden={!open} inert={!open ? true : undefined}>
      {item.links.map((link) => <Link href={link.href} key={link.href} aria-current={path === link.href ? 'page' : undefined}><span><strong>{link.label}</strong><small>{link.description}</small></span><ArrowRight aria-hidden="true" /></Link>)}
    </div>
  </div>;
}

export function SiteHeader() {
  const path = usePathname();
  const isHome = path === '/';
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => setMobileOpen(false), [path]);

  const mobileNavigation = mobileOpen ? <MobileNavigation path={path} onClose={() => setMobileOpen(false)} triggerRef={trigger} /> : null;

  return <>
    <header className="site-header capital-command-bar" data-home={isHome ? 'true' : 'false'} data-scrolled={scrolled ? 'true' : 'false'}>
      <div className="nav-shell">
        <Brand tone={isHome ? 'teal' : 'current'} />
        <nav className="desktop-command-nav" aria-label="Primary navigation">
          {PRODUCT_FAMILY_LINKS.map((item) => <Link className="desktop-domain-link" href={item.href} key={item.label} aria-current={path === item.href ? 'page' : undefined}>{item.label}</Link>)}
          {NAVIGATION.map((item) => <DesktopDisclosure item={item} path={path} key={item.label} />)}
        </nav>
        <div className="command-actions">
          <Link href={SITE.signInUrl}>Sign In</Link>
          <Link className="elite-header-entry command-primary-action" href={SITE.signUpUrl}>Get Started</Link>
        </div>
        <div className="elite-header-actions">
          <Link className="elite-header-entry" href={SITE.signInUrl}>Sign In</Link>
          <button ref={trigger} className="elite-menu-trigger" type="button" aria-expanded={mobileOpen} aria-controls="mobile-command-sheet" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    {mounted && mobileNavigation ? createPortal(mobileNavigation, document.body) : null}
  </>;
}
