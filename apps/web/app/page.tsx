import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroArchitecture } from '@/components/hero-architecture';
import { ProductStage } from '@/components/product-stage';
import { OperatingModelVisual, PlatformArchitectureVisual } from '@/components/product-visuals';
import { Reveal } from '@/components/reveal';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Digital capital, organized around you.',
  description: SITE.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="home-composition">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-shell">
          <div className="home-hero-copy">
            <p className="home-kicker">Capital precision</p>
            <h1 id="home-hero-title">
              <span>Digital capital,</span>
              <span>organized around</span>
              <span>you.</span>
            </h1>
            <p className="home-hero-intro">
              A capital operating platform for understanding, governing and organizing digital
              capital through one coherent environment.
            </p>
            <a className="button home-primary-action" href={SITE.accessUrl}>
              Enter Neptlium <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <HeroArchitecture />
        </div>
      </section>

      <section className="home-quiet" aria-labelledby="home-quiet-title">
        <Reveal>
          <div className="home-editorial-measure">
            <p className="home-kicker">One operating environment</p>
            <h2 id="home-quiet-title">Capital infrastructure, presented with clarity.</h2>
            <p>
              Portfolio intelligence, Capital Account, Treasury and Allocation organized as one
              coherent system—with observed, modeled and authorized state kept distinct.
            </p>
          </div>
        </Reveal>
      </section>

      <ProductStage />

      <section className="home-operating" aria-labelledby="operating-model-title">
        <div className="home-wide-shell">
          <Reveal>
            <header className="home-section-heading">
              <p className="home-kicker">Operating model</p>
              <h2 id="operating-model-title">Movement follows understanding.</h2>
              <p>
                Each stage has a distinct purpose. Modeling and approval do not prove execution.
              </p>
            </header>
          </Reveal>
          <Reveal>
            <OperatingModelVisual />
          </Reveal>
        </div>
      </section>

      <section className="home-infrastructure" aria-labelledby="infrastructure-title">
        <div className="home-infrastructure-shell">
          <Reveal className="home-infrastructure-visual">
            <PlatformArchitectureVisual />
          </Reveal>
          <Reveal className="home-infrastructure-copy">
            <p className="home-kicker">Infrastructure and control</p>
            <h2 id="infrastructure-title">One system. Explicit boundaries.</h2>
            <p>
              Neptlium separates customer interaction, policy, provider evidence and canonical
              financial state. External observations remain evidence until they are reconciled.
            </p>
            <dl className="home-control-list">
              <div>
                <dt>Current foundation</dt>
                <dd>Supabase data and identity infrastructure with Circle testnet groundwork.</dd>
              </div>
              <div>
                <dt>Control principle</dt>
                <dd>Provider observation is not canonical ledger truth.</dd>
              </div>
              <div>
                <dt>Execution</dt>
                <dd>
                  Unavailable where authorization, durable operations or reconciliation are
                  incomplete.
                </dd>
              </div>
            </dl>
            <Link className="home-inline-link" href="/platform">
              Explore the platform <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="home-resolution" aria-labelledby="home-resolution-title">
        <Reveal>
          <div className="home-resolution-inner">
            <p className="home-kicker">Neptlium</p>
            <h2 id="home-resolution-title">Capital, organized with precision.</h2>
            <p>
              A clearer operating environment for capital position, liquidity and governed
              decisions.
            </p>
            <a className="button home-primary-action" href={SITE.accessUrl}>
              Enter Neptlium <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
