import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Universe — Strategic Product Direction',
  description:
    'Supporting strategic context for Neptlium’s provider-independent capital model. This page does not establish asset, network, market or execution availability.',
  path: '/capital-universe',
  index: false,
});

export default function Page() {
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Strategic product direction</p>
          <h1>A provider-independent model for capital.</h1>
          <p>
            Neptlium is designed around capital roles and operating state rather than one asset class.
            Strategic architecture does not establish that a particular asset, network, market or
            provider is available in production.
          </p>
        </div>
      </section>

      <section className="detail-sections">
        <article>
          <span>01</span>
          <div>
            <h2>Capital roles before product labels</h2>
            <p>
              Reserve, operating, core, growth and opportunity contexts can remain meaningful without
              turning a strategic classification into a custody, brokerage or execution claim.
            </p>
          </div>
        </article>

        <article>
          <span>02</span>
          <div>
            <h2>Availability requires evidence</h2>
            <p>
              Asset, network, funding and market availability depends on verified product,
              infrastructure, jurisdiction and account capability. Future architecture is not current
              capability.
            </p>
          </div>
        </article>
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
