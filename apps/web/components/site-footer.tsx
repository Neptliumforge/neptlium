import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const groups = [
  {
    title: 'Platform',
    links: [
      ['Platform Overview', '/platform'],
      ['Portfolio Intelligence', '/portfolio-intelligence'],
      ['Capital Account', '/capital-account'],
      ['Treasury', '/treasury'],
      ['Allocation', '/allocation'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['Capital Organization', '/platform'],
      ['Portfolio Oversight', '/portfolio-intelligence'],
      ['Treasury Management', '/treasury'],
      ['Allocation Planning', '/allocation'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Research & Perspectives', '/research'],
      ['Learn', '/learn'],
      ['Security', '/security'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Neptlium', '/about'],
      ['Principles', '/company#principles'],
      ['Contact', '/contact'],
    ],
  },
] as const;

const legal = [
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
  ['Risk Disclosure', '/risk-disclosure'],
] as const;

export function SiteFooter() {
  return (
    <footer className="institutional-footer">
      <div className="footer-atmosphere" aria-hidden="true" />

      <div className="footer-shell">
        <section className="footer-primary" aria-label="Neptlium footer navigation">
          <div className="footer-brand-column">
            <Brand />
            <p className="footer-brand-statement">
              Capital operating infrastructure for modern digital capital.
            </p>
            <p className="footer-brand-copy">
              A governed environment for portfolio intelligence, capital accounts, treasury and allocation.
            </p>
            <a className="footer-platform-link" href={SITE.accessUrl}>
              Open Neptlium
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className="footer-navigation-grid">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2>{group.title}</h2>
                <div>
                  {group.links.map(([label, href]) => (
                    <Link key={`${group.title}-${label}`} href={href}>
                      {label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </section>

        <section className="footer-closing" aria-labelledby="footer-closing-title">
          <div>
            <span className="footer-kicker">Capital operating infrastructure</span>
            <h2 id="footer-closing-title">
              Own across markets.
              <br />
              Operate as one portfolio.
            </h2>
          </div>
          <p>
            Neptlium brings portfolio intelligence, capital accounts, treasury and allocation into one governed operating environment.
          </p>
        </section>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav aria-label="Legal">
            {legal.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
