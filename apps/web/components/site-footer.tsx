import Link from 'next/link';
import { Brand } from './brand';

const verifiedDestinations = [
  { label: 'Privacy', href: '/privacy', external: false },
  { label: 'GitHub', href: 'https://github.com/Neptliumlabs', external: true },
] as const;

export function SiteFooter() {
  return (
    <footer className="minimal-marketing-footer">
      <div className="production-shell minimal-footer-inner">
        <Brand />
        <nav aria-label="Footer navigation">
          {verifiedDestinations.map((destination) =>
            destination.external ? (
              <a key={destination.label} href={destination.href} target="_blank" rel="noreferrer">
                {destination.label}
              </a>
            ) : (
              <Link key={destination.label} href={destination.href}>
                {destination.label}
              </Link>
            ),
          )}
        </nav>
        <span>© {new Date().getFullYear()} Neptlium</span>
      </div>
    </footer>
  );
}
