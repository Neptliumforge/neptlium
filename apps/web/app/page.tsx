import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, RefreshCcw, ShieldCheck } from 'lucide-react';
import {
  CapitalAccountVisual,
  CapitalSystemVisual,
  OperatingEnvironmentVisual,
  PortfolioVisual,
  SecurityFlowVisual,
} from '@/components/product-visuals';
import { DISCLOSURES } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './marketing-platform.module.css';

export const metadata = createPageMetadata({
  title: 'Capital, made clearer',
  description: 'Neptlium is a modern capital platform for portfolio visibility, funding, reporting and governed financial activity.',
  path: '/',
});

const trustPoints = [
  ['Authenticated account access', 'Customer access begins with verified identity and authenticated sessions.'],
  ['Governed transaction workflows', 'Financial actions preserve explicit lifecycle states instead of treating a click as settlement.'],
  ['Financial record integrity', 'Provider evidence, canonical state and reconciliation remain distinct responsibilities.'],
  ['Investor reporting', 'Activity, documents and account context are designed to remain inspectable over time.'],
] as const;

const journey = [
  ['Create your account', 'Open the authenticated Neptlium environment.'],
  ['Complete required verification', 'Account access and product availability can depend on identity, eligibility and operating requirements.'],
  ['Fund your account', 'Use only funding routes made available to your account.'],
  ['Review available opportunities', 'Evaluate objective, structure, risk, liquidity and supporting documentation where opportunities are offered.'],
  ['Allocate capital', 'Use supported workflows without collapsing a model or approval into execution.'],
  ['Monitor your portfolio', 'Follow capital state, portfolio context and account activity from one environment.'],
  ['Access records and reports', 'Keep transaction history, documents and reporting close to the capital they describe.'],
] as const;

export default function HomePage() {
  return (
    <div className={`${styles.scope} mp-home`}>
      <section className="mp-hero" aria-labelledby="home-title">
        <div className="mp-shell mp-hero-grid">
          <div className="mp-hero-copy">
            <p className="mp-kicker">Modern capital infrastructure</p>
            <h1 id="home-title">Capital, made clearer.</h1>
            <p className="mp-hero-lead">Neptlium brings portfolio visibility, capital management, funding workflows, reporting and governed financial activity into one coherent environment.</p>
            <div className="mp-actions">
              <Link className="mp-button mp-button-primary" href="/platform">Explore the Platform <ArrowRight aria-hidden="true" /></Link>
              <Link className="mp-button mp-button-secondary" href="/investments">View Investment Solutions</Link>
            </div>
            <p className="mp-hero-note">No fabricated balances, performance or transaction states are used in this public product demonstration.</p>
          </div>
          <div className="mp-hero-product" aria-label="Neptlium product demonstration">
            <OperatingEnvironmentVisual />
          </div>
        </div>
      </section>

      <section className="mp-trust-band" aria-labelledby="trust-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Institutional trust</p>
            <h2 id="trust-title">Trust should be visible in how the product behaves.</h2>
          </div>
          <div className="mp-trust-grid">
            {trustPoints.map(([title, body], index) => <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="mp-section mp-platform-section" aria-labelledby="platform-title">
        <div className="mp-shell mp-split">
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Platform</p>
            <h2 id="platform-title">One environment for understanding capital before acting on it.</h2>
            <p>Neptlium connects capital state, portfolio context, treasury, allocation and governed financial workflows without making different states look more authoritative than they are.</p>
            <Link className="mp-text-link" href="/platform">Explore the platform <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mp-visual-plane"><CapitalSystemVisual /></div>
        </div>
      </section>

      <section className="mp-section mp-dark" aria-labelledby="investment-experience-title">
        <div className="mp-shell">
          <div className="mp-section-heading">
            <p className="mp-kicker">Investment experience</p>
            <h2 id="investment-experience-title">Information first. Capital action second.</h2>
            <p>When investment opportunities are available, the experience should make objective, structure, exposure, risk, liquidity, documentation and eligibility understandable before a commitment is made.</p>
          </div>
          <div className="mp-investment-principles">
            {['Objective', 'Underlying exposure', 'Risk', 'Liquidity', 'Documentation', 'Eligibility'].map((item) => <span key={item}>{item}</span>)}
          </div>
          <Link className="mp-button mp-button-light" href="/investments">View the investment framework <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="mp-section" aria-labelledby="portfolio-title">
        <div className="mp-shell mp-split reverse">
          <div className="mp-visual-plane"><PortfolioVisual /></div>
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Portfolio intelligence</p>
            <h2 id="portfolio-title">Understand what you own without inventing what is not known.</h2>
            <p>Portfolio views are designed to distinguish available information from unavailable or modeled state, so reporting can become more useful without becoming misleading.</p>
            <Link className="mp-text-link" href="/products/portfolio-intelligence">Explore Portfolio Intelligence <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="mp-section mp-funding" aria-labelledby="funding-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Funding infrastructure</p>
            <h2 id="funding-title">Funding instructions should be explicit, attributable and governed.</h2>
            <p>Neptlium separates the customer instruction, provider evidence, canonical financial state and reconciliation required to understand where capital stands.</p>
          </div>
          <div className="mp-funding-grid">
            <article>
              <h3>Digital asset funding</h3>
              <p>Supported routes are exposed through account-specific funding capabilities and governed funding intents. Availability depends on the account and current supported infrastructure.</p>
              <span>Capability-controlled</span>
            </article>
            <article>
              <h3>USD funding</h3>
              <p>USD funding is not represented on this website as a currently available public capability. Any future payment flow must preserve attribution, settlement evidence, ledger posting and reconciliation.</p>
              <span>Not presented as live</span>
            </article>
          </div>
          <div className="mp-visual-plane funding-visual"><CapitalAccountVisual /></div>
        </div>
      </section>

      <section className="mp-section mp-solutions" aria-labelledby="solutions-title">
        <div className="mp-shell">
          <div className="mp-section-heading">
            <p className="mp-kicker">Investment solutions</p>
            <h2 id="solutions-title">A disciplined framework for evaluating opportunities.</h2>
            <p>Neptlium does not reduce an investment to a return number. Public investment presentation is organized around objective, strategy, structure, exposure, risk, duration, liquidity, fees, documentation and suitability.</p>
          </div>
          <div className="mp-solution-lines">
            {[
              ['Objective', 'What the investment is designed to achieve.'],
              ['Strategy', 'How capital is intended to be deployed.'],
              ['Risk', 'What could impair capital or outcomes.'],
              ['Liquidity', 'When and how capital may become available.'],
              ['Documentation', 'What supports the investment structure and investor decision.'],
            ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <Link className="mp-text-link" href="/investments">Explore investments <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="mp-section mp-security" aria-labelledby="security-title">
        <div className="mp-shell mp-split">
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Security & financial integrity</p>
            <h2 id="security-title">Security is part of the financial workflow.</h2>
            <p>Identity, authorization, ownership, auditability and reconciliation are separate control boundaries. The public site does not claim certifications, insurance or regulatory status that have not been verified.</p>
            <div className="mp-security-list">
              <span><LockKeyhole aria-hidden="true" /> Authenticated account access</span>
              <span><ShieldCheck aria-hidden="true" /> Server-enforced financial controls</span>
              <span><RefreshCcw aria-hidden="true" /> Reconciliation-aware state</span>
            </div>
            <Link className="mp-text-link" href="/security">Explore Security <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mp-visual-plane"><SecurityFlowVisual /></div>
        </div>
      </section>

      <section className="mp-section mp-journey" aria-labelledby="journey-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">How Neptlium works</p>
            <h2 id="journey-title">A clearer investor journey from account access to reporting.</h2>
          </div>
          <ol className="mp-journey-list">
            {journey.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="mp-section mp-reporting" aria-labelledby="reporting-title">
        <div className="mp-shell mp-split reverse">
          <div className="mp-reporting-visual" aria-hidden="true">
            <div><FileText /><span>Account statements</span></div>
            <div><CheckCircle2 /><span>Transaction records</span></div>
            <div><FileText /><span>Investment documents</span></div>
            <div><FileText /><span>Portfolio reports</span></div>
          </div>
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Investor reporting</p>
            <h2 id="reporting-title">The record should stay close to the decision.</h2>
            <p>Statements, transaction records, investment documentation, disclosures and portfolio reporting are treated as part of the investor experience—not administrative leftovers.</p>
            <Link className="mp-text-link" href="/platform">See the reporting model <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="mp-section mp-insights-preview" aria-labelledby="insights-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Insights</p>
            <h2 id="insights-title">Intelligence for understanding capital more clearly.</h2>
            <p>Neptlium Insights is the editorial home for investment perspectives, portfolio strategy, market education, digital-asset context and product understanding. Research is published only when substantive original material exists.</p>
          </div>
          <div className="mp-insight-links">
            <Link href="/learn">Investor education <ArrowRight aria-hidden="true" /></Link>
            <Link href="/research">Research <ArrowRight aria-hidden="true" /></Link>
            <Link href="/insights">Explore Insights <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="mp-disclosure" aria-label="Investment disclosure">
        <div className="mp-shell"><p>{DISCLOSURES.investment}</p><p>{DISCLOSURES.general}</p></div>
      </section>
    </div>
  );
}
