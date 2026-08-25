import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { COMPANY, PRIMARY_PRODUCTS, RESOURCES, SOLUTIONS } from '@/lib/content/public-architecture';

type FooterLink = {
  readonly label: string;
  readonly href: string;
};

const footerGroups: readonly {
  readonly label: string;
  readonly href: string;
  readonly links: readonly FooterLink[];
}[] = [
  {
    label: 'Platform',
    href: '/platform',
    links: [],
  },
  {
    label: 'Products',
    href: '/products',
    links: PRIMARY_PRODUCTS.map(({ label, href }) => ({ label, href })),
  },
  {
    label: 'Solutions',
    href: '/solutions',
    links: SOLUTIONS.map(({ label, href }) => ({ label, href })),
  },
  {
    label: 'Resources',
    href: '/resources',
    links: RESOURCES.map(({ label, href }) => ({ label, href })),
  },
  {
    label: 'Company',
    href: '/company',
    links: COMPANY.map(({ label, href }) => ({ label, href })),
  },
] as const;

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Accessibility', href: '/accessibility' },
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
          </div>

          <div className="footer-navigation-grid" aria-label="Footer navigation groups">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h3>
                  <Link href={group.href}>{group.label}</Link>
                </h3>
                {group.links.length > 0 ? (
                  <div>
                    {group.links.map((destination) => (
                      <Link key={`${group.label}-${destination.href}`} href={destination.href}>
                        {destination.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <span>Capital operating platform</span>
          <nav
            aria-label="Legal"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem 1rem', marginLeft: 'auto' }}
          >
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ marginLeft: 0 }}>
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com/Neptliumforge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Neptliumforge on GitHub (opens in a new tab)"
            style={{ marginLeft: 0 }}
          >
            GitHub <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
