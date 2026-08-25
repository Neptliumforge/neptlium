import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AllocationVisual, CapitalAccountVisual, TreasuryVisual } from './product-visuals';
import { Reveal } from './reveal';

const stages = [
  {
    index: '01',
    eyebrow: 'Capital Account',
    title: 'Know what capital is available, reserved and in motion.',
    body: 'A governed account environment for supported funding, capital movement and activity—without turning provider observations into invented balances.',
    href: '/products/capital-account',
    link: 'Explore Capital Account',
    visual: <CapitalAccountVisual />,
    reverse: false,
  },
  {
    index: '02',
    eyebrow: 'Treasury',
    title: 'Coordinate liquidity with control.',
    body: 'Understand available, reserved and committed capital in context. Treasury is an intelligence layer, not a transfer engine.',
    href: '/products/treasury',
    link: 'Explore Treasury',
    visual: <TreasuryVisual />,
    reverse: true,
  },
  {
    index: '03',
    eyebrow: 'Allocation',
    title: 'Structure decisions before capital moves.',
    body: 'Observe position, model scenarios and preserve explicit review between allocation intent and any authorized execution path.',
    href: '/products/allocation',
    link: 'Explore Allocation',
    visual: <AllocationVisual />,
    reverse: false,
  },
] as const;

export function ProductStage() {
  return (
    <section className="home-product-system" aria-labelledby="product-system-title">
      <div className="home-product-intro">
        <Reveal>
          <p className="home-kicker">Product system</p>
          <h2 id="product-system-title">A working environment, not a collection of features.</h2>
          <p>
            Product areas share one operating model while preserving the meaning of observed,
            proposed, reserved and unavailable state.
          </p>
        </Reveal>
      </div>

      <div className="home-product-stages">
        {stages.map((stage) => (
          <article
            className={`home-product-stage ${stage.reverse ? 'is-reversed' : ''}`}
            key={stage.eyebrow}
          >
            <Reveal className="home-product-copy">
              <span className="home-product-index">{stage.index}</span>
              <p className="home-kicker">{stage.eyebrow}</p>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
              <Link className="home-inline-link" href={stage.href}>
                {stage.link} <ArrowRight aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal className="home-product-environment">{stage.visual}</Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
