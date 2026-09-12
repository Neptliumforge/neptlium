import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CinematicScrollStory } from '@/components/cinematic-scroll-story';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Platform — Capital Operating Model | Neptlium',
  description: 'Neptlium connects capital state, operating context and governed work while preserving the boundaries between observed, modeled, reviewed, authorized and consequential state.',
  path: '/platform',
});

export default function PlatformPage() {
  return (
    <div className="cin-home">
      <section className="cin-hero" aria-labelledby="platform-title">
        <div className="cin-hero-copy">
          <p className="cin-kicker">Platform</p>
          <h1 id="platform-title">One operating environment for capital.</h1>
          <p>Keep portfolio state, liquidity, intent, evidence, review and authority connected without collapsing their different meanings.</p>
          <div className="cin-actions">
            <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
        <figure className="cin-hero-object">
          <img src="/marketing/overview.webp" alt="Illustrative Neptlium capital operating environment represented as layered financial planes" />
          <figcaption>Illustrative Neptlium operating environment</figcaption>
        </figure>
      </section>

      <CinematicScrollStory />

      <section className="cin-intelligence">
        <div><p className="cin-kicker">Operating principle</p><h2>Context should survive the handoff.</h2></div>
        <p>Capital work becomes easier to reason about when account state can inform treasury, treasury can constrain allocation, and portfolio intelligence can interpret the result without turning visibility into authority.</p>
      </section>

      <section className="cin-trust" aria-labelledby="platform-boundary-title">
        <p className="cin-kicker">Explicit boundaries</p>
        <h2 id="platform-boundary-title">A visible state is not permission to change it.</h2>
        <div className="cin-lifecycle" aria-label="Neptlium state lifecycle">
          {['Observed', 'Modeled', 'Reviewed', 'Authorized', 'Consequential'].map((item, index) => <span key={item}>{item}{index < 4 ? <i>→</i> : null}</span>)}
        </div>
        <p>Neptlium keeps evidence, interpretation, review, authorization and consequence distinct so the system never claims more than the operating state supports.</p>
      </section>
    </div>
  );
}
