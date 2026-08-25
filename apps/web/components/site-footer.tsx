import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
      { label: 'Overview', href: '/platform' },
      { label: 'Portfolio', href: '/portfolio-intelligence' },
      { label: 'Capital Account', href: '/capital-account' },
      { label: 'Treasury', href: '/treasury' },
      { label: 'Allocation', href: '/allocation' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { label: 'Learn', href: '/learn' },
      { label: 'Security', href: '/security' },
      { label: 'About', href: '/about' },
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
        {destination.label} <ArrowUpRight aria-hidden="true" />
      </a>
    );
  }

  return <Link href={destination.href}>{destination.label}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="institutional-footer" aria-label="Neptlium footer">
      <div className="footer-shell">
        <div className="footer-primary">
          <div className="footer-brand-column">
            <Brand />
            <h2>Keep your capital work connected.</h2>
            <p className="footer-brand-copy">
              Bring portfolio context, treasury and allocation into one clear operating platform.
            </p>
            <div className="footer-actions">
              <Link className="footer-primary-action" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="footer-secondary-action" href={SITE.exploreUrl}>
                {SITE.exploreLabel}
              </Link>
            </div>
          </div>

          <div className="footer-navigation-grid" aria-label="Footer navigation groups">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h3>{group.label}</h3>
                <div>
                  {group.links.map((destination) => (
                    <FooterDestination key={`${group.label}-${destination.label}`} destination={destination} />
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <span>Capital operating platform</span>
        </div>
      </div>
    </footer>
  );
}
