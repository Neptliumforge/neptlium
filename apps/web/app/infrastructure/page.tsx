import { PageContext } from '@/components/page-context';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Infrastructure',
  description:
    'Explore Neptlium Pay, wallet architecture, APIs and developer documentation with clear distinctions between available and planned capabilities.',
  path: '/infrastructure',
});

const capabilities = [
  {
    label: 'Pay',
    status: 'Product surface',
    copy: 'Payment experiences designed around clear intent, authorization boundaries and a minimally privileged public surface.',
    href: '/payments',
    action: 'Explore payments',
  },
  {
    label: 'Wallet direction',
    status: 'Planned architecture',
    copy: 'A planned wallet experience for asset visibility, network context and secure transaction architecture. Network support, custody and execution are not implied to be live.',
    href: '/infrastructure#wallet',
    action: 'View planned wallet direction',
  },
  {
    label: 'API',
    status: 'Developer infrastructure',
    copy: 'The server-side boundary for Neptlium product and financial systems. Public clients do not receive privileged financial authority.',
    href: 'https://docs.neptlium.com',
    action: 'Read developer docs',
  },
  {
    label: 'Documentation',
    status: 'Technical guidance',
    copy: 'Developer contracts, integration guidance and capability status for building with Neptlium.',
    href: 'https://docs.neptlium.com',
    action: 'Open documentation',
  },
] as const;

function InfrastructurePageContent() {
  return (
    <div className="family-page" data-npt-surface="ivory">
      <div className="family-shell">
        <section className="family-hero" aria-labelledby="infrastructure-title">
          <div>
            <p className="family-label">Infrastructure</p>
            <h1 className="np-hero" id="infrastructure-title">Build on Neptlium.</h1>
          </div>
          <div className="family-hero-copy">
            <p>
              Neptlium Infrastructure brings payment surfaces, wallet architecture, APIs and
              developer documentation into one technical environment. Financial authority remains
              server-side and capabilities are described according to their verified product state.
            </p>
            <div className="family-actions">
              <a className="family-action family-action-primary" href="https://docs.neptlium.com">Open documentation</a>
              <a className="family-action" href="https://status.neptlium.com">View system status</a>
            </div>
          </div>
        </section>

        <section className="family-grid" aria-label="Infrastructure capabilities">
          {capabilities.map(({ label, status, copy, href, action }) => (
            <article className="family-card" id={label === "Wallet direction" ? "wallet" : undefined} key={label}>
              <span>{status}</span>
              <h2>{label}</h2>
              <p>{copy}</p>
              <Link href={href}>{action} <ArrowUpRight aria-hidden="true" /></Link>
            </article>
          ))}
        </section>

        <p className="family-note">
          Product availability is stated at the relevant surface. A planned wallet direction does
          not establish supported networks, custody, key management, live transaction submission or
          settlement. Public product descriptions never imply financial authority or execution that
          has not been verified.
        </p>
      </div>
    </div>
  );
}

export default function InfrastructurePage() {
  return <><InfrastructurePageContent /><PageContext route="/infrastructure" /></>;
}
