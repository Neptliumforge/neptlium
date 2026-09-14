import Link from 'next/link';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const legalLinks = [
  { label: 'Security', href: '/security' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Risk disclosure', href: '/risk-disclosure' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Cookies', href: '/cookie-policy' },
] as const;

const socialLinks = [
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
] as const;

export function SiteFooter() {
  return <footer className="neptlium-minimal-footer" aria-label="Neptlium footer">
    <div className="neptlium-minimal-footer__shell">
      <div className="neptlium-minimal-footer__top">
        <div className="neptlium-minimal-footer__identity">
          <Brand tone="teal" />
          <p>Capital systems for people, businesses and institutions.</p>
          <div className="neptlium-minimal-footer__social" aria-label="Neptlium social channels">{socialLinks.map((link) => <a href={link.href} key={link.href} rel="noreferrer">{link.label}</a>)}</div>
        </div>
        <div className="neptlium-minimal-footer__status"><span>Neptlium system</span><a href={SITE.statusUrl}>View system status →</a></div>
      </div>
      <div className="neptlium-minimal-footer__base">
        <nav className="neptlium-minimal-footer__legal" aria-label="Legal and trust">{legalLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <span className="neptlium-minimal-footer__copyright">© {new Date().getFullYear()} Neptlium</span>
      </div>
    </div>
  </footer>;
}
