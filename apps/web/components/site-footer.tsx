import Link from 'next/link';
import { Brand } from './brand';
import { NAVIGATION } from '../lib/content/public-architecture';
import chrome from './site-chrome.module.css';

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

export function SiteFooter() {
  return (
    <footer className={chrome.footer} aria-label="Neptlium footer">
      <div className={chrome.footerShell}>
        <div className={chrome.footerSignature}>
          <div className={chrome.footerIdentity}>
            <Brand />
            <p className={chrome.footerStatement}>
              A capital operating environment for understanding, coordinating and governing what you
              own.
            </p>
          </div>

          <nav className={chrome.footerNavigation} aria-label="Institutional architecture">
            {NAVIGATION.map((group) => (
              <div className={chrome.footerGroup} key={group.href}>
                <Link className={chrome.footerGroupLabel} href={group.href}>
                  {group.label}
                </Link>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className={chrome.footerBase}>
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav className={chrome.legal} aria-label="Legal">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
