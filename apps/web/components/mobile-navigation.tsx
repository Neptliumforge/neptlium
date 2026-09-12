'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useEffect, useRef, type RefObject } from 'react';
import { Brand } from './brand';
import { NAVIGATION } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';

const socialLinks = [
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt' },
] as const;

export function MobileNavigation({
  path,
  onClose,
  triggerRef,
}: {
  path: string;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
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
      triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  const platform = NAVIGATION[0];
  const sections = NAVIGATION.slice(1);

  return (
    <div className="mobile-command-wrap" role="dialog" aria-modal="true" aria-label="Navigation">
      <div id="mobile-command-sheet" className="mobile-command-sheet" ref={panelRef}>
        <div className="mobile-command-head">
          <Brand tone="current" />
          <div className="mobile-command-head-actions">
            <Link className="mobile-command-entry" href={SITE.publicAccessUrl}>
              {SITE.publicAccessLabel}
            </Link>
            <button ref={closeRef} type="button" aria-label="Close navigation" onClick={onClose}>
              <X aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav className="mobile-command-nav" aria-label="Mobile navigation">
          <Link
            className="mobile-platform-link"
            href={platform.href}
            aria-current={path === platform.href ? 'page' : undefined}
          >
            <span>{platform.label}</span>
            <ArrowRight aria-hidden="true" />
          </Link>

          <div className="mobile-nav-grid">
            {sections.map((section) => (
              <section key={section.label}>
                <Link className="mobile-section-label" href={section.href}>
                  {section.label}
                </Link>
                <div className="mobile-section-links">
                  {section.links.map((link) => (
                    <Link
                      href={link.href}
                      key={link.href}
                      aria-current={path === link.href ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mobile-social-block" aria-label="Social channels">
            <span>Socials</span>
            <div>
              {socialLinks.map((social) => (
                <a href={social.href} key={social.href} target="_blank" rel="noopener noreferrer">
                  {social.label}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        </nav>
      </div>
    </div>
  );
}
