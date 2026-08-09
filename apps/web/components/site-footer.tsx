import Link from 'next/link';
import { Brand } from './brand';

const groups = [
  [
    'Platform',
    [
      ['Portfolio Intelligence', '/portfolio-intelligence'],
      ['Capital Account', '/capital-account'],
      ['Treasury', '/treasury'],
      ['Allocation', '/allocation'],
    ],
  ],
  [
    'Resources',
    [
      ['Research', '/research'],
      ['Learn', '/learn'],
      ['Security', '/security'],
    ],
  ],
  [
    'Company',
    [
      ['About', '/about'],
      ['Principles', '/company#principles'],
      ['Contact', '/contact'],
    ],
  ],
  [
    'Legal',
    [
      ['Privacy', '/privacy'],
      ['Terms', '/terms'],
      ['Risk Disclosure', '/risk-disclosure'],
    ],
  ],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Brand />
          <p>
            Capital operating infrastructure
            <br />
            for digital ownership.
          </p>
        </div>
        {groups.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h2>{title}</h2>
            {links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-base">
        <span>© Neptlium</span>
        <span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
