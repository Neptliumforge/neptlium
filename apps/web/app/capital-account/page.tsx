import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetIdentity } from '@neptlium/ui';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
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
    <>
      <PageHeader
        title="Capital needs an operating layer."
        intro="The Capital Account organizes supported digital capital within explicit account and network boundaries."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Capital Account' }]}
      />
      <Section>
        <CapitalAccountVisual />
      </Section>
      <Section>
        <div className="route-split">
          <div>
            <h2>Account infrastructure, not a trading screen.</h2>
            <p>Funding, asset context and account activity remain connected to the wider portfolio and its controls.</p>
          </div>
          <dl>
            <div><dt>Account context</dt><dd>Supported capital organized in one account view.</dd></div>
            <div><dt>Network context</dt><dd>Asset and network boundaries remain visible.</dd></div>
            <div><dt>Operational control</dt><dd>Consequential actions remain explicit and reviewable.</dd></div>
          </dl>
        </div>
      </Section>
      <Section tone="surface">
        <div className="supported-capital">
          <h2>Supported capital direction</h2>
          <div>
            {assets.map(([asset, network]) => (
              <article key={asset}>
                <AssetIdentity asset={asset} network={network} size="lg" detailed />
              </article>
            ))}
          </div>
          <p>Asset and network availability depends on production integrations and account eligibility.</p>
        </div>
      </Section>
      <Section>
        <div className="route-action">
          <a className="button" href={SITE.accessUrl}>Get started <ArrowRight size={17} aria-hidden="true" /></a>
          <Link href="/platform">Explore the platform</Link>
        </div>
      </Section>
    </>
  );
}
