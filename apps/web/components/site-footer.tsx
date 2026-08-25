import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { COMPANY, PRODUCTS, RESOURCES, SOLUTIONS } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';

type FooterLink = {
  readonly label: string;
  readonly href: string;
};

const footerGroups: readonly { readonly label: string; readonly links: readonly FooterLink[] }[] = [
  {
    label: 'Platform',
    links: [{ label: 'Platform overview', href: '/platform' }],
  },
  {
    label: 'Products',
    links: [{ label: 'All products', href: '/products' }, ...PRODUCTS.map(({ label, href }) => ({ label, href }))],
  },
  {
    label: 'Solutions',
    links: [{ label: 'Solutions overview', href: '/solutions' }, ...SOLUTIONS.map(({ label, href }) => ({ label, href }))],
  },
  {
    label: 'Resources',
    links: [{ label: 'Resources overview', href: '/resources' }, ...RESOURCES.map(({ label, href }) => ({ label, href }))],
  },
  {
    label: 'Company',
    links: [{ label: 'Company overview', href: '/company' }, ...COMPANY.map(({ label, href }) => ({ label, href }))],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Risk Disclosure', href: '/risk-disclosure' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="institutional-footer" aria-label="Neptlium footer">
      <div className="footer-shell">
        <div className="footer-primary">
          <div className="footer-brand-column">
            <Brand />
            <h2>Keep your capital work connected.</h2>
            <p className="footer-brand-copy">
              Neptlium organizes capital context, movement, treasury, allocation and intelligence through
              one operating model.
            </p>
            <div className="footer-actions">
              <Link className="footer-primary-action" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="footer-secondary-action" href="/platform">
                Explore platform
              </Link>
            </div>
          </div>

          <div className="footer-navigation-grid" aria-label="Footer navigation groups">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h3>{group.label}</h3>
                <div>
                  {group.links.map((destination) => (
                    <Link key={`${group.label}-${destination.href}`} href={destination.href}>
                      {destination.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <span>Capital operating platform</span>
          <a
            href="https://github.com/Neptliumforge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Neptliumforge on GitHub (opens in a new tab)"
          >
            GitHub <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
