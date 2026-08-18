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
    label: 'Resources',
    links: [
      { label: 'Research & Perspectives', href: '/research' },
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
    ],
  },
  {
    label: 'Connect',
    links: [
      {
        label: 'Bluesky',
        href: 'https://bsky.app/profile/neptlium.bsky.social',
        external: true,
        accessibleLabel: 'Neptlium on Bluesky (opens in a new tab)',
      },
      {
        label: 'X',
        href: 'https://x.com/Neptlium',
        external: true,
        accessibleLabel: 'Neptlium on X (opens in a new tab)',
      },
      {
        label: 'YouTube',
        href: 'https://youtube.com/@neptlium',
        external: true,
        accessibleLabel: 'Neptlium on YouTube (opens in a new tab)',
      },
      {
        label: 'TikTok',
        href: 'https://www.tiktok.com/@neptlium',
        external: true,
        accessibleLabel: 'Neptlium on TikTok (opens in a new tab)',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/Neptliumlabs',
        external: true,
        accessibleLabel: 'Neptlium Labs on GitHub (opens in a new tab)',
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
            <p className="footer-brand-statement">Capital operating infrastructure for modern digital capital.</p>
            <p className="footer-brand-copy">
              Explore Neptlium’s public platform, research and operating principles without treating the public website as financial authority.
            </p>
            <a className="footer-platform-link" href={SITE.signInUrl}>
              Open Neptlium <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className="footer-navigation-grid" aria-label="Footer navigation groups">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2>{group.label}</h2>
                <div>
                  {group.links.map((destination) => (
                    <FooterDestination key={destination.label} destination={destination} />
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-closing">
          <div>
            <span className="footer-kicker">Capital precision</span>
            <h2>Capital, organized with precision.</h2>
          </div>
          <p>
            Understand the system, its operating boundaries and the principles that govern how Neptlium presents capital state.
          </p>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav aria-label="Footer legal links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/risk-disclosure">Risk Disclosure</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
