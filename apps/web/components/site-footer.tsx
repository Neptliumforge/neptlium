import Link from 'next/link';
import { Brand } from './brand';

const footerGroups = [
  { label: 'Legal', links: [{ label: 'Privacy', href: '/privacy', external: false }] },
  { label: 'Corporate', links: [{ label: 'About', href: '/about', external: false }, { label: 'Contact', href: '/contact', external: false }] },
  { label: 'Social', links: [{ label: 'GitHub', href: 'https://github.com/Neptliumlabs', external: true }] },
] as const;

export function SiteFooter() {
  return (
    <footer className="minimal-marketing-footer">
      <div className="production-shell institutional-footer-inner">
        <div className="footer-brand-block">
          <Brand />
          <p>Capital, made operational.</p>
          <span>© {new Date().getFullYear()} Neptlium</span>
        </div>
        <nav className="footer-groups" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <strong>{group.label}</strong>
              {group.links.map((destination) =>
                destination.external ? (
                  <a key={destination.label} href={destination.href} target="_blank" rel="noreferrer">{destination.label}</a>
                ) : (
                  <Link key={destination.label} href={destination.href}>{destination.label}</Link>
                ),
              )}
            </section>
          ))}
        </nav>
      </div>
    </footer>
  );
}
