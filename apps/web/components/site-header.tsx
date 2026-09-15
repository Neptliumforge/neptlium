'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';
import { MobileNavigation } from './mobile-navigation';
import { NAVIGATION } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';

type MarketingSurface = 'carbon' | 'white' | 'ivory' | 'cloud' | 'mineral' | 'mineral-light';

function AccountMenu({ kind }: { kind: 'signin' | 'start' }) {
  const start = kind === 'start';
  return <details className="account-menu">
    <summary className={start ? 'account-menu-trigger account-menu-primary' : 'account-menu-trigger'}>{start ? 'Get started' : 'Sign in'}</summary>
    <div className="account-menu-panel" role="group" aria-label={start ? 'Get started options' : 'Sign in options'}>
      <a href={start ? SITE.personalSignUpUrl : SITE.personalSignInUrl}><strong>Personal</strong><span>Neptlium Capital</span></a>
      <a href={SITE.businessAppUrl}><strong>Business</strong><span>{start ? 'Open Neptlium Treasury' : 'Sign in to Neptlium Treasury'}</span></a>
    </div>
  </details>;
}

export function SiteHeader() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topSurface, setTopSurface] = useState<MarketingSurface>('carbon');
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const readTopSurface = () => {
      const firstSurface = document.querySelector<HTMLElement>('[data-npt-surface]');
      const surface = firstSurface?.dataset.nptSurface as MarketingSurface | undefined;
      if (surface) setTopSurface(surface);
    };
    const frame = window.requestAnimationFrame(readTopSurface);
    return () => window.cancelAnimationFrame(frame);
  }, [path]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [path]);

  return <>
    <header className="site-header capital-command-bar" data-scrolled={scrolled ? 'true' : 'false'} data-surface={scrolled ? 'carbon' : topSurface}>
      <div className="nav-shell">
        <Brand tone="teal" />
        <nav className="desktop-command-nav" aria-label="Primary navigation">
          {NAVIGATION.map((item) => <Link key={item.href} href={item.href} aria-current={path === item.href || path.startsWith(`${item.href}/`) ? 'page' : undefined}>{item.label}</Link>)}
        </nav>
        <div className="command-actions"><AccountMenu kind="signin" /><AccountMenu kind="start" /></div>
        <div className="elite-header-actions">
          <button ref={trigger} className="elite-menu-trigger" type="button" aria-expanded={mobileOpen} aria-controls="mobile-command-sheet" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    {mounted && mobileOpen ? createPortal(<MobileNavigation path={path} onClose={() => setMobileOpen(false)} triggerRef={trigger} />, document.body) : null}
  </>;
}
