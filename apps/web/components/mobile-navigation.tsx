'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronLeft, X } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Brand } from './brand';
import { NAVIGATION } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';

export function MobileNavigation({ path, onClose, triggerRef }: { path: string; onClose: () => void; triggerRef: RefObject<HTMLButtonElement | null>; }) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  return <div className="mobile-command-wrap" role="dialog" aria-modal="true" aria-label="Navigation">
    <div id="mobile-command-sheet" className="mobile-command-sheet" ref={panelRef}>
      <div className="mobile-command-head"><Brand tone="teal" /><button ref={closeRef} type="button" aria-label="Close navigation" onClick={onClose}><X aria-hidden="true" /></button></div>
      <nav className="mobile-command-nav" aria-label="Mobile navigation">
        {activeSection ? (
          <div className="mobile-nav-detail">
            <button className="mobile-nav-back" type="button" onClick={() => setActiveSection(null)}><ChevronLeft aria-hidden="true" /> Back</button>
            <h2>{activeSection}</h2>
            <div className="mobile-nav-detail-links">
              {NAVIGATION.find((section) => section.label === activeSection)?.links.map((link) => (
                <Link href={link.href} key={link.href} onClick={onClose} aria-current={path === link.href ? 'page' : undefined}>
                  <span>{link.label}<small>{link.description}</small></span><ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mobile-nav-grid">{NAVIGATION.map((section) => <section key={section.label}>
            <button className="mobile-section-label" type="button" onClick={() => setActiveSection(section.label)} aria-label={`Explore ${section.label}`}>
              <span>{section.label}</span><ArrowRight aria-hidden="true" />
            </button>
          </section>)}</div>
        )}
        <div className="mobile-account-actions" aria-label="Account access">
          <a href={SITE.personalSignInUrl}>Sign in</a>
          <a className="mobile-enter-action" href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></a>
        </div>

      </nav>
    </div>
  </div>;
}
