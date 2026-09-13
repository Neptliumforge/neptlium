import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const columns = [
  { label: 'Platform', links: [{ label: 'Overview', href: '/platform' }, { label: 'Capital', href: '/products/capital-account' }, { label: 'Treasury', href: '/products/treasury' }, { label: 'Allocation', href: '/products/allocation' }] },
  { label: 'Investments', links: [{ label: 'Investment experience', href: '/investments' }, { label: 'Portfolio intelligence', href: '/products/portfolio-intelligence' }, { label: 'Solutions', href: '/solutions' }] },
  { label: 'Company', links: [{ label: 'Insights', href: '/insights' }, { label: 'Security', href: '/security' }, { label: 'Company', href: '/company' }, { label: 'Contact', href: '/contact' }] },
  { label: 'Account', links: [{ label: 'Sign in', href: SITE.signInUrl }, { label: 'Open account', href: SITE.signUpUrl }] },
] as const;

const legalLinks = [
  { label: 'Risk disclosure', href: '/risk-disclosure' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookie-policy' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

const socialLinks = [
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt' },
] as const;

export function SiteFooter() {
  return <footer className="elite-footer" aria-label="Neptlium footer"><div className="elite-footer-shell">
    <div className="elite-footer-architecture">
      <div className="elite-footer-identity"><Brand tone="teal" /><p className="elite-footer-statement">Capital, intelligently managed.</p><p className="elite-footer-statement">A governed financial environment for capital, treasury, investments, portfolio intelligence and allocation.</p></div>
      {columns.map((column) => <section className="elite-footer-column" key={column.label}><span className="elite-footer-title">{column.label}</span><div className="elite-footer-links">{column.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div></section>)}
    </div>
    <section className="elite-footer-column" aria-label="Social"><span className="elite-footer-title">Social</span><div className="elite-footer-links">{socialLinks.map((social) => <a className="elite-social-link" href={social.href} key={social.href} target="_blank" rel="noopener noreferrer">{social.label}<ArrowUpRight aria-hidden="true" /></a>)}</div></section>
    <p className="elite-footer-statement">Information on this website is informational and does not constitute investment advice. Investing and digital-asset activity involve risk, including possible loss of principal. Product availability depends on current account, provider, infrastructure and eligibility state.</p>
    <div className="elite-footer-base"><span>© {new Date().getFullYear()} Neptlium</span><nav className="elite-footer-legal" aria-label="Legal">{legalLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
  </div></footer>;
}
