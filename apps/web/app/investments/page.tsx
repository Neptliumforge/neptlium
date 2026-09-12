import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import styles from '../marketing-platform.module.css';

export const metadata = createPageMetadata({
  title: 'Investments',
  description: 'How Neptlium presents investment opportunities, structure, risk, liquidity, documentation and suitability.',
  path: '/investments',
});

const framework = [
  ['Objective', 'What the investment is designed to achieve and the assumptions behind that objective.'],
  ['Strategy', 'How capital is intended to be deployed and what drives the investment thesis.'],
  ['Structure', 'How the opportunity is organized, including the investor’s economic exposure where applicable.'],
  ['Risk', 'Material risks, uncertainty and factors that could impair capital or outcomes.'],
  ['Liquidity', 'When and how capital may become available, including relevant restrictions or review requirements.'],
  ['Fees', 'Applicable charges should be presented clearly before an investor commits capital.'],
  ['Documentation', 'Supporting agreements, disclosures, updates and reporting should remain accessible throughout the investment lifecycle.'],
  ['Suitability', 'Availability can depend on account, eligibility, jurisdiction and product requirements.'],
] as const;

export default function InvestmentsPage() {
  return <div className={`${styles.scope} mp-home`}>
    <section className="mp-hero">
      <div className="mp-shell mp-hero-grid">
        <div className="mp-hero-copy">
          <p className="mp-kicker">Investments</p>
          <h1>Investment information before investment action.</h1>
          <p className="mp-hero-lead">Neptlium is designed to present opportunities with the structure, risk, liquidity, documentation and context required for a disciplined investor decision.</p>
          <div className="mp-actions">
            <Link className="mp-button mp-button-primary" href={SITE.signUpUrl}>Get Started <ArrowRight aria-hidden="true" /></Link>
            <Link className="mp-button mp-button-secondary" href="/platform">Explore the Platform</Link>
          </div>
        </div>
        <div className="mp-hero-product">
          <div className="investment-memo-visual" aria-label="Investment review framework">
            <div><span>Investment objective</span><strong>Understand the purpose before the projection.</strong></div>
            <div><span>Underlying exposure</span><strong>Know what ultimately drives the investment.</strong></div>
            <div><span>Risk & liquidity</span><strong>Understand downside, duration and access to capital.</strong></div>
            <div><span>Documentation</span><strong>Keep the supporting record close to the decision.</strong></div>
          </div>
        </div>
      </div>
    </section>

    <section className="mp-section">
      <div className="mp-shell">
        <div className="mp-section-heading">
          <p className="mp-kicker">Investment discipline</p>
          <h2>Opportunities should be understood as systems, not return percentages.</h2>
          <p>Neptlium’s public investment architecture is built around what an investor needs to understand before committing capital. Target, projected, illustrative and historical information must remain clearly distinguished whenever those categories are used.</p>
        </div>
        <div className="mp-solution-lines">
          {framework.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </div>
    </section>

    <section className="mp-section mp-dark">
      <div className="mp-shell">
        <div className="mp-section-heading compact">
          <p className="mp-kicker">Opportunity availability</p>
          <h2>Neptlium does not manufacture a marketplace when no verified offering is available.</h2>
          <p>The public site will only present live opportunities when the underlying investment, documentation, eligibility, operating process and investor action path are genuinely supported. Until then, this page defines the standard every opportunity must meet.</p>
        </div>
        <Link className="mp-button mp-button-light" href="/contact">Contact Neptlium <ArrowRight aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="mp-disclosure" aria-label="Investment disclosure"><div className="mp-shell"><p>{DISCLOSURES.investment}</p><p>{DISCLOSURES.general}</p></div></section>
  </div>;
}
