import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetIdentity } from '@neptlium/ui';
import { PageHeader } from '@/components/page-header';
import { SITE } from '@/lib/content/site';
import { CapitalAccountVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Capital Account | Neptlium',
  description: 'Organize supported assets within explicit account, network and funding boundaries.',
  alternates: { canonical: '/capital-account' },
};

const assets = [
  ['USDC', 'Base'],
  ['ETH', 'Base'],
  ['BTC', 'Bitcoin'],
] as const;

export default function Page() {
  return (
    <div className="route-product-page capital-account-route">
      <PageHeader
        eyebrow="Capital Account"
        title="Capital needs an operating layer."
        intro="Organize supported digital capital within explicit account, network and authorization boundaries."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Capital Account' }]}
      />

      <section className="route-product-showcase">
        <div className="container-page route-product-showcase-grid">
          <div className="route-product-copy">
            <span className="route-product-kicker">Account infrastructure</span>
            <h2>One governed account view.</h2>
            <p>
              Funding, asset context and account activity remain connected to the wider portfolio without turning the account into a trading screen.
            </p>
            <div className="route-product-asset-strip" aria-label="Supported capital direction">
              {assets.map(([asset, network]) => (
                <AssetIdentity key={asset} asset={asset} network={network} size="md" detailed />
              ))}
            </div>
            <div className="route-product-actions">
              <a className="button" href={SITE.accessUrl}>
                Open Neptlium <ArrowRight aria-hidden="true" />
              </a>
              <Link href="/platform">Explore platform</Link>
            </div>
          </div>

          <div className="route-product-visual">
            <CapitalAccountVisual />
          </div>
        </div>
      </section>

      <section className="route-product-capabilities">
        <div className="container-page route-product-capability-grid">
          <article>
            <h3>Account context</h3>
            <p>Supported capital organized in one account view.</p>
          </article>
          <article>
            <h3>Network context</h3>
            <p>Asset and network boundaries remain visible.</p>
          </article>
          <article>
            <h3>Operational control</h3>
            <p>Consequential actions remain explicit and reviewable.</p>
          </article>
        </div>
        <p className="container-page route-product-disclosure">
          Asset and network availability depends on production integrations and account eligibility.
        </p>
      </section>
    </div>
  );
}
