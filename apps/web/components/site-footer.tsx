import Link from 'next/link';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const groups = [
  { label: 'Product', links: [
    ['Capital', '/capital'], ['Portfolio', '/portfolio'], ['Investments', '/investments'],
    ['Treasury', '/treasury'], ['Intelligence', '/intelligence'],
  ] },
  { label: 'Platform', links: [
    ['Institutional', '/institutional'], ['Infrastructure', '/infrastructure'], ['Security', '/security'],
  ] },
  { label: 'Resources', links: [
    ['Insights', '/insights'], ['Learn', '/learn'], ['Support', '/contact'],
  ] },
  { label: 'Company', links: [
    ['Company', '/company'], ['Contact', '/contact'],
  ] },
] as const;

const legalLinks = [
  ['Privacy', '/privacy'], ['Terms', '/terms'], ['Risk disclosure', '/risk-disclosure'],
  ['Accessibility', '/accessibility'], ['Cookies', '/cookie-policy'],
] as const;

export function SiteFooter() {
  return <footer className="neptlium-minimal-footer" aria-label="Neptlium footer">
    <div className="neptlium-minimal-footer__shell">
      <div className="neptlium-footer-directory">
        <div className="neptlium-minimal-footer__identity">
          <Brand tone="teal" />
          <p>Capital, intelligently managed.</p>
          <span>One capital operating platform for individuals and organizations.</span>
        </div>
        {groups.map((group) => <nav key={group.label} aria-label={group.label}>
          <strong>{group.label}</strong>
          {group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>)}
        <nav aria-label="Account">
          <strong>Account</strong>
          <a href={SITE.personalSignInUrl}>Sign in</a>
          <a href={SITE.personalSignUpUrl}>Sign up</a>
          <a href={SITE.businessAppUrl}>Treasury access</a>
        </nav>
      </div>
      <div className="neptlium-minimal-footer__base">
        <nav className="neptlium-minimal-footer__legal" aria-label="Legal">{legalLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        <a href={SITE.statusUrl}>System status</a>
        <span className="neptlium-minimal-footer__copyright">© {new Date().getFullYear()} Neptlium</span>
      </div>
    </div>
  </footer>;
}
