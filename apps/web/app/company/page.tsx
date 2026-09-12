import Link from 'next/link';
import { ArrowRight, FileText, Layers3, Scale, ShieldCheck } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../marketing-platform.module.css';

export const metadata = createPageMetadata({
  title: 'Company — Mission and Operating Philosophy | Neptlium',
  description: 'Neptlium is building a clearer operating environment for portfolio context, funding, investment information, reporting and governed financial activity.',
  path: '/company',
});

const principles = [
  ['Clarity before consequence', 'Capital decisions are easier to reason about when portfolio state, liquidity, movement history, constraints and intent remain connected before an action becomes consequential.'],
  ['Financial truth over presentation', 'Observed, provider-reported, modeled, authorized and reconciled information should retain the distinctions that give each state meaning.'],
  ['Authority should be explicit', 'Identity, ownership, review and permission belong in the operating architecture rather than being implied by an interface or marketing promise.'],
  ['Product boundaries should stay visible', 'Neptlium should describe what the platform supports, what depends on external providers and what remains unavailable without manufacturing certainty.'],
] as const;

export default function CompanyPage() {
  return (
    <div className={`${styles.scope} mp-home`}>
      <section className="mp-hero" aria-labelledby="company-title">
        <div className="mp-shell mp-hero-grid">
          <div className="mp-hero-copy">
            <p className="mp-kicker">Company</p>
            <h1 id="company-title">Build capital systems people can understand and trust.</h1>
            <p className="mp-hero-lead">Neptlium is focused on making portfolio context, funding, investment information, reporting and financial activity easier to understand without collapsing the boundaries that keep financial state honest.</p>
            <div className="mp-actions">
              <Link className="mp-button mp-button-primary" href="/platform">Explore the Platform <ArrowRight aria-hidden="true" /></Link>
              <Link className="mp-button mp-button-secondary" href="/contact">Contact Neptlium</Link>
            </div>
          </div>
          <div className="mp-reporting-visual" aria-label="Neptlium operating philosophy">
            <div><Layers3 aria-hidden="true" /><span>Connected operating context</span></div>
            <div><Scale aria-hidden="true" /><span>Disciplined authority</span></div>
            <div><ShieldCheck aria-hidden="true" /><span>Financial integrity</span></div>
            <div><FileText aria-hidden="true" /><span>Inspectable records</span></div>
          </div>
        </div>
      </section>

      <section className="mp-trust-band" aria-labelledby="mission-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Mission</p>
            <h2 id="mission-title">Reduce the distance between understanding capital and governing what happens next.</h2>
            <p>Financial information loses value when portfolio state, liquidity, investment context, movement and reporting live in disconnected systems. Neptlium is building an environment where those responsibilities can remain connected without pretending they are identical.</p>
          </div>
        </div>
      </section>

      <section className="mp-section" aria-labelledby="principles-title">
        <div className="mp-shell">
          <div className="mp-section-heading">
            <div><p className="mp-kicker">Operating philosophy</p><h2 id="principles-title">The company should operate with the same discipline the product requires.</h2></div>
            <p>Neptlium’s public language and product architecture follow the same rule: make meaningful distinctions visible, qualify dependent capabilities and avoid manufacturing authority through presentation.</p>
          </div>
          <div className="mp-trust-grid">
            {principles.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mp-section mp-dark" aria-labelledby="platform-philosophy-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Platform philosophy</p>
            <h2 id="platform-philosophy-title">Portfolio visibility, funding, investments and reporting describe one capital system from different angles.</h2>
            <p>Neptlium combines those responsibilities because a transaction is easier to understand when its portfolio context, purpose, authority and resulting record remain close to it. The goal is coherence, not a single interface pretending to replace every specialist system.</p>
          </div>
          <div className="mp-investment-principles">
            {['Portfolio context', 'Funding state', 'Investment information', 'Transaction lifecycle', 'Reporting', 'Governance'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>

      <section className="mp-section mp-security" aria-labelledby="integrity-title">
        <div className="mp-shell mp-split">
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Technology & financial integrity</p>
            <h2 id="integrity-title">Technology should make financial state more legible, not more theatrical.</h2>
            <p>Neptlium is designed around explicit lifecycle state, server-side financial authority, attributable evidence and reconciliation-aware records. Product demonstrations and public claims follow the same standard: unknown or unavailable information is not turned into synthetic financial proof.</p>
            <Link className="mp-text-link" href="/security">Explore Security <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mp-solution-lines">
            <article><h3>State</h3><p>Keep observed, modeled, authorized and reconciled information distinguishable.</p></article>
            <article><h3>Authority</h3><p>Keep presentation separate from the systems responsible for consequential financial decisions.</p></article>
            <article><h3>Evidence</h3><p>Keep provider and internal records attributable so disagreement can be inspected rather than hidden.</p></article>
            <article><h3>Limits</h3><p>Keep unavailable capabilities and dependencies visible instead of marketing roadmap work as production reality.</p></article>
          </div>
        </div>
      </section>

      <section className="mp-section mp-reporting" aria-labelledby="direction-title">
        <div className="mp-shell mp-split reverse">
          <div className="mp-reporting-visual" aria-hidden="true">
            <div><Layers3 /><span>Clearer capital context</span></div>
            <div><Scale /><span>More explicit controls</span></div>
            <div><FileText /><span>Better financial records</span></div>
            <div><ShieldCheck /><span>Truthful capability boundaries</span></div>
          </div>
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Long-term direction</p>
            <h2 id="direction-title">Build a more coherent operating environment without presenting future capability as present fact.</h2>
            <p>Neptlium’s direction is to deepen the connection between capital context, investment information, movement, governance and reporting. Public availability remains determined by what the production platform can substantiate at the time a customer uses it.</p>
          </div>
        </div>
      </section>

      <section className="mp-section mp-dark" aria-labelledby="company-cta-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Next step</p>
            <h2 id="company-cta-title">See how the operating philosophy becomes product.</h2>
          </div>
          <div className="mp-actions">
            <Link className="mp-button mp-button-light" href="/platform">Explore Neptlium <ArrowRight aria-hidden="true" /></Link>
            <Link className="mp-button mp-button-secondary" href={SITE.signUpUrl}>Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
