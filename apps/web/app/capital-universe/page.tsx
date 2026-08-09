import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetIdentity } from '@neptlium/ui';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Capital Universe',
  description: 'The supported digital-capital direction for Neptlium.',
  alternates: { canonical: '/capital-universe' },
};
const assets = [
  [
    'USDC',
    'Base',
    'A dollar-denominated asset direction for capital accounts, treasury context and allocation structure on Base.',
  ],
  [
    'ETH',
    'Base',
    'Native digital capital direction on Base, organized within the same governed portfolio environment.',
  ],
  [
    'BTC',
    'Bitcoin',
    'Bitcoin capital direction within portfolio intelligence, treasury and deliberate allocation workflows.',
  ],
] as const;
export default function Page() {
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Capital Universe</p>
          <h1>A focused digital-asset foundation.</h1>
          <p>
            Neptlium is crypto-only. Its supported direction is focused on USDC and ETH on Base, and
            BTC on Bitcoin.
          </p>
        </div>
      </section>
      <section className="detail-sections">
        {assets.map(([asset, network, body], i) => (
          <article key={asset}>
            <span>0{i + 1}</span>
            <div>
              <AssetIdentity asset={asset} network={network} size="lg" detailed />
              <p className="mt-4">{body}</p>
            </div>
          </article>
        ))}
        <p className="qualifier">
          Asset and network availability depends on production integrations and account eligibility.
        </p>
      </section>
      <section className="detail-cta">
        <h2>Explore the operating environment.</h2>
        <a className="button" href={SITE.accessUrl}>
          Get started <ArrowRight />
        </a>
        <Link href="/platform">Explore platform</Link>
      </section>
    </>
  );
}
