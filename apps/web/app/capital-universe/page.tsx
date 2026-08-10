import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetIdentity } from '@neptlium/ui';

export const metadata: Metadata = {
  title: 'Capital Universe',
  description: 'Current digital-asset direction and the future multi-asset capital model for Neptlium.',
  alternates: { canonical: '/capital-universe' },
};

const digitalAssets = [
  ['USDC', 'Base', 'Current and planned digital-capital architecture; actual availability depends on provider and account capability.'],
  ['BTC', 'Bitcoin', 'Part of the governed digital-asset capital direction; execution availability is not implied.'],
  ['ETH', 'Base', 'Part of the governed digital-asset capital direction on supported networks.'],
] as const;

export default function Page() {
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Capital Universe</p>
          <h1>A broader model for capital.</h1>
          <p>
            Neptlium is not defined by one asset class. The current foundation centers on digital
            assets while the product constitution preserves a future path to supported fiat and
            listed-market exposure.
          </p>
        </div>
      </section>

      <section className="detail-sections">
        <article>
          <span>01</span>
          <div>
            <h2>Digital assets</h2>
            <div className="capital-universe-asset-list">
              {digitalAssets.map(([asset, network, body]) => (
                <div key={asset}>
                  <AssetIdentity asset={asset} network={network} size="lg" detailed />
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article>
          <span>02</span>
          <div>
            <h2>Listed markets</h2>
            <p>
              Equities are part of the future Neptlium capital universe. No brokerage, stock-trading,
              listed-security custody or equity execution capability is represented as implemented.
            </p>
            <div className="capital-universe-future">
              <span>Equities</span>
              <span>Funds</span>
              <strong>Future architecture</strong>
            </div>
          </div>
        </article>

        <p className="qualifier">
          Asset, network, funding and market availability depends on verified product,
          provider, jurisdiction and account capability.
        </p>
      </section>

      <section className="detail-cta">
        <h2>Explore the capital operating environment.</h2>
        <Link className="button" href="/platform">
          Explore platform <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
