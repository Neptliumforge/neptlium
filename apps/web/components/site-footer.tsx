import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const columns = [
  { label: 'Products', links: [{ label: 'Personal', href: '/personal' }, { label: 'Business', href: '/business' }, { label: 'Platform', href: '/platform' }] },
  { label: 'Capital', links: [{ label: 'Investments', href: '/investments' }, { label: 'Portfolio', href: '/portfolio' }, { label: 'Allocation', href: '/allocation' }] },
  { label: 'Treasury', links: [{ label: 'Neptlium Treasury', href: '/treasury' }, { label: 'Payments', href: SITE.payUrl }, { label: 'Open Treasury', href: SITE.businessAppUrl }] },
  { label: 'Infrastructure', links: [{ label: 'API', href: SITE.apiUrl }, { label: 'Documentation', href: SITE.docsUrl }, { label: 'Status', href: SITE.statusUrl }, { label: 'Security', href: '/security' }] },
  { label: 'Company', links: [{ label: 'About', href: '/company' }, { label: 'Insights', href: '/insights' }, { label: 'Contact', href: '/contact' }] },
] as const;

const legalLinks = [
  { label: 'Risk disclosure', href: '/risk-disclosure' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookie-policy' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

const destinations = [
  { label: 'Neptlium Capital', href: SITE.personalAppUrl },
  { label: 'Neptlium Treasury', href: SITE.businessAppUrl },
] as const;

export function SiteFooter() {
  return <footer className="elite-footer" aria-label="Neptlium footer"><div className="elite-footer-shell">
    <div className="elite-footer-architecture">
      <div className="elite-footer-identity"><Brand tone="teal" /><p className="elite-footer-statement">Capital, treasury and financial infrastructure for people, businesses and institutions.</p><div className="elite-footer-destinations">{destinations.map((item) => <a key={item.href} href={item.href}>{item.label}<ArrowUpRight aria-hidden="true" /></a>)}</div></div>
      {columns.map((column) => <section className="elite-footer-column" key={column.label}><span className="elite-footer-title">{column.label}</span><div className="elite-footer-links">{column.links.map((link) => link.href.startsWith('http') ? <a key={link.href} href={link.href}>{link.label}</a> : <Link key={link.href} href={link.href}>{link.label}</Link>)}</div></section>)}
    </div>
    <p className="elite-footer-statement elite-footer-disclosure">Information on this website is informational and does not constitute investment advice. Investing and digital-asset activity involve risk, including possible loss of principal. Business treasury and payment capabilities depend on eligibility, supported infrastructure and current product availability.</p>
    <div className="elite-footer-base"><span>© {new Date().getFullYear()} Neptlium</span><nav className="elite-footer-legal" aria-label="Legal">{legalLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
  </div></footer>;
}
