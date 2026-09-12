import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const columns = [
  {
    label: 'Platform',
    links: [
      { label: 'Overview', href: '/platform' },
      { label: 'Investments', href: '/investments' },
      { label: 'Funding', href: '/products/capital-account' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Insights', href: '/insights' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Account',
    links: [
      { label: 'Sign In', href: SITE.signInUrl },
      { label: 'Create Account', href: SITE.signUpUrl },
    ],
  },
] as const;

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

const socialLinks = [
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt' },
] as const;

export function SiteFooter() {
  return (
    <footer className="elite-footer" aria-label="Neptlium footer">
      <div className="elite-footer-shell">
        <div className="elite-footer-architecture">
          <div className="elite-footer-identity">
            <Brand tone="teal" />
            <p className="elite-footer-statement">Capital, made clearer.</p>
            <p className="elite-footer-statement">A modern capital platform for portfolio visibility, funding, reporting and governed financial activity.</p>
          </div>

          {columns.map((column) => <section className="elite-footer-column" key={column.label}>
            <span className="elite-footer-title">{column.label}</span>
            <div className="elite-footer-links">{column.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
          </section>)}

          <section className="elite-footer-column">
            <span className="elite-footer-title">Social</span>
            <div className="elite-footer-links">{socialLinks.map((social) => <a className="elite-social-link" href={social.href} key={social.href} target="_blank" rel="noopener noreferrer">{social.label}<ArrowUpRight aria-hidden="true" /></a>)}</div>
          </section>
        </div>

        <p className="elite-footer-statement">Information on this website is for informational purposes and does not constitute investment advice. Investing and digital-asset activity involve risk, including possible loss of principal.</p>

        <div className="elite-footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav className="elite-footer-legal" aria-label="Legal">{legalLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        </div>
      </div>
    </footer>
  );
}
