import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import marketing from '../marketing-platform.module.css';
import insightStyles from './insights.module.css';

export const metadata = createPageMetadata({
  title: 'Insights',
  description: 'Investment perspectives, portfolio strategy, investor education and substantive Neptlium research.',
  path: '/insights',
});

const categories = [
  ['Markets', 'Context for understanding market conditions without converting commentary into investment certainty.'],
  ['Investing', 'Frameworks for evaluating objective, exposure, duration, liquidity and risk.'],
  ['Portfolio Strategy', 'Ideas for understanding concentration, allocation, capital roles and portfolio context.'],
  ['Digital Assets', 'Education on digital-asset structure, networks, custody boundaries and transaction risk.'],
  ['Platform', 'How Neptlium approaches capital visibility, funding, reporting and governed workflows.'],
  ['Investor Education', 'Clear explanations of financial concepts and account workflows.'],
] as const;

export default function InsightsPage() {
  return <div className={`${marketing.scope} mp-home`}>
    <section className="mp-hero insights-hero">
      <div className="mp-shell mp-hero-grid">
        <div className="mp-hero-copy">
          <p className="mp-kicker">Insights</p>
          <h1>Intelligence for clearer capital decisions.</h1>
          <p className="mp-hero-lead">Neptlium Insights is the editorial home for investment perspectives, portfolio strategy, platform understanding and investor education. Research is published only when substantive original work exists.</p>
          <div className="mp-actions">
            <Link className="mp-button mp-button-primary" href="/learn">Explore Investor Education <ArrowRight aria-hidden="true" /></Link>
            <Link className="mp-button mp-button-secondary" href="/research">View Research</Link>
          </div>
        </div>
        <div className={insightStyles.mark} aria-hidden="true"><span>Signal</span><span>Context</span><span>Evidence</span><span>Interpretation</span></div>
      </div>
    </section>

    <section className="mp-section">
      <div className="mp-shell">
        <div className="mp-section-heading compact">
          <p className="mp-kicker">Editorial architecture</p>
          <h2>Financial content should make uncertainty easier to understand.</h2>
          <p>Fact, data, model output, scenario, estimate, interpretation and opinion should remain visibly distinct. Neptlium will not invent articles, findings, reports or publication dates to make the library appear more mature than it is.</p>
        </div>
        <div className={insightStyles.grid}>
          {categories.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </div>
    </section>

    <section className="mp-section mp-dark">
      <div className="mp-shell mp-split">
        <div className="mp-sticky-copy"><p className="mp-kicker">Learn</p><h2>Start with the concepts that shape capital decisions.</h2><p>Investor education explains product structure, financial terminology, operating states and risk without assuming prior institutional knowledge.</p><Link className="mp-button mp-button-light" href="/learn">Explore Learn <ArrowRight aria-hidden="true" /></Link></div>
        <div className="mp-sticky-copy"><p className="mp-kicker">Research</p><h2>Original research should earn its authority.</h2><p>The Research surface remains deliberately restrained until substantive, dated Neptlium analysis exists. Publication quality matters more than volume.</p><Link className="mp-button mp-button-secondary" href="/research">Open Research <ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </section>
  </div>;
}
