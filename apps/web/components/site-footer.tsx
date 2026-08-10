import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Brand } from './brand';
import { SITE } from '@/lib/content/site';

const groups = [
  {
    title: 'Platform',
    links: [
      ['Capital Account', '/capital-account'],
      ['Portfolio', '/portfolio-intelligence'],
      ['Treasury', '/treasury'],
      ['Allocation', '/allocation'],
    ],
  },
  {
    title: 'Infrastructure',
    links: [
      ['Platform architecture', '/platform'],
      ['Connectivity', '/neptlium-link'],
      ['Capital activity', '/capital-activity'],
      ['Security', '/security'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Principles', '/company#principles'],
      ['Contact', '/contact'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Research', '/research'],
      ['Learn', '/learn'],
      ['Trust', '/trust'],
      ['Risk disclosure', '/risk-disclosure'],
    ],
  },
] as const;

const legal = [
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
  ['Security', '/security'],
] as const;

export function SiteFooter() {
  return (
    <footer className="institutional-ledger-footer">
      <div className="ledger-footer-shell">
        <section className="ledger-closing" aria-labelledby="ledger-closing-title">
          <div>
            <h2 id="ledger-closing-title">
              Capital infrastructure,
              <br />
              built for control.
            </h2>
            <p>
              Neptlium provides the operating environment for understanding, governing and
              directing modern capital.
            </p>
          </div>
          <a className="ledger-footer-cta" href={SITE.accessUrl}>
            Access Neptlium <ArrowRight aria-hidden="true" />
          </a>
        </section>

        <div className="ledger-hairline" />

        <section className="ledger-navigation" aria-label="Footer navigation">
          <div className="ledger-brand">
            <Brand tone="paper" />
            <p>Capital operations with explicit state, control and reconciliation.</p>
          </div>
          <div className="ledger-groups">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3>{group.title}</h3>
                {group.links.map(([label, href]) => (
                  <Link key={`${group.title}-${label}`} href={href}>
                    {label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </section>

        <div className="ledger-footer-base">
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav aria-label="Legal">
            {legal.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <span className="ledger-status">
            <i aria-hidden="true" />
            Product capability shown truthfully
          </span>
        </div>
      </div>
    </footer>
  );
}
