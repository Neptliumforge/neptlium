import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

type FooterLink = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly accessibleLabel?: string;
};

const footerGroups: readonly { readonly label: string; readonly links: readonly FooterLink[] }[] = [
  {
    label: 'Platform',
    links: [
      { label: 'Platform Overview', href: '/platform' },
      { label: 'Portfolio Intelligence', href: '/portfolio-intelligence' },
      { label: 'Capital Account', href: '/capital-account' },
      { label: 'Treasury', href: '/treasury' },
      { label: 'Allocation', href: '/allocation' },
    ],
  },
  {
    label: 'Solutions',
    links: [
      { label: 'Capital Account', href: '/capital-account' },
      { label: 'Treasury', href: '/treasury' },
      { label: 'Allocation', href: '/allocation' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Learn', href: '/learn' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About Neptlium', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Risk Disclosure', href: '/risk-disclosure' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  {
    label: 'Connect',
    links: [
      { label: 'Contact', href: '/contact' },
      {
        label: 'GitHub',
        href: 'https://github.com/Neptliumforge',
        external: true,
        accessibleLabel: 'Neptliumforge on GitHub (opens in a new tab)',
      },
    ],
  },
] as const;

function FooterDestination({ destination }: { readonly destination: FooterLink }) {
  if (destination.external) {
    return (
      <a
        href={destination.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={destination.accessibleLabel}
      >
        {destination.label}
      </a>
    );
  }

  return <Link href={destination.href}>{destination.label}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="institutional-footer" aria-label="Neptlium footer">
      <div className="footer-atmosphere" aria-hidden="true" />
      <div className="footer-shell">
        <div className="footer-primary">
          <div className="footer-brand-column">
            <Brand />
            <p className="footer-brand-statement">
              A capital operating platform for modern investment organizations.
            </p>
            <p className="footer-brand-copy">
              Portfolio context, capital operations, treasury and governed allocation in one coherent
              institutional environment.
            </p>
            <Link className="footer-platform-link" href={SITE.publicAccessUrl}>
              {SITE.publicAccessLabel} <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="footer-navigation-grid" aria-label="Footer navigation groups">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2>{group.label}</h2>
                <div>
                  {group.links.map((destination) => (
                    <FooterDestination key={`${group.label}-${destination.label}`} destination={destination} />
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-closing">
          <div>
            <span className="footer-kicker">Capital operating infrastructure</span>
            <h2>Capital, organized with precision.</h2>
          </div>
          <p>
            A shared operating language for portfolio context, treasury, capital movement and allocation.
          </p>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav aria-label="Footer legal links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/risk-disclosure">Risk Disclosure</Link>
            <Link href="/accessibility">Accessibility</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
