import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from '../product-depth.module.css';

export const metadata = createPageMetadata({
  title: 'Portfolio Intelligence — Composition, Exposure and Relationships | Neptlium',
  description: 'Neptlium Portfolio Intelligence gives composition, exposure, concentration, relationships, change and evidence a common operating context.',
  path: '/products/portfolio-intelligence',
});

const lenses = [
  ['Composition', 'Understand what the available evidence says the portfolio contains and how that scope is defined.'],
  ['Exposure', 'See where economic relationships may accumulate across strategies, entities, geographies, currencies or other represented dimensions.'],
  ['Relationships', 'Preserve how holdings, entities, commitments, liquidity and allocation context connect rather than treating each record as isolated.'],
  ['Concentration', 'Identify where capital or dependency gathers in ways that may deserve deeper review, including overlap hidden by nominal diversification.'],
  ['Change', 'Read the current portfolio against the sequence of movements, allocation decisions and operating events that shaped it.'],
  ['Evidence', 'Keep source-reported, derived, modeled and authoritative information distinct so interpretation never outruns what the evidence supports.'],
] as const;

const questions = [
  ['What do we own?', 'Composition should be legible across the structures through which the organization actually understands capital.'],
  ['What are we exposed to?', 'Exposure should reveal shared dependencies that a simple holding list can conceal.'],
  ['What connects the portfolio?', 'Ownership, entities, capital roles, liquidity and commitments form relationships that influence one another.'],
  ['What changed?', 'Current state becomes more meaningful when its evolution and the decisions behind it remain visible.'],
  ['Why does it matter?', 'Intelligence should connect an observation to its context, evidence and potential consequence without manufacturing certainty.'],
] as const;

export default function PortfolioIntelligencePage() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={`web-shell ${styles.heroGrid}`}>
        <div><p className="web-eyebrow on-light">04 · Portfolio Intelligence</p><h1>See the portfolio as a system, not a list of holdings.</h1></div>
        <div className={styles.heroLead}>
          <p><strong>Portfolio Intelligence is where ownership becomes structured understanding.</strong></p>
          <p>It brings composition, exposure, concentration, relationships, liquidity and capital context into one interpretive environment so the portfolio can be understood by structure and consequence—not only by position.</p>
          <p>The analytical question moves from <strong>“What do we hold?”</strong> to <strong>“What does the system of capital we hold actually mean?”</strong></p>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="portfolio-lenses-title">
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Analytical lenses</p><h2 id="portfolio-lenses-title">Read the portfolio through relationships, not isolated records.</h2></div><p className={styles.sectionIntro}>A position can simultaneously be an asset, part of an entity, an exposure, an allocation, a liquidity characteristic and part of a wider capital structure. Portfolio Intelligence is designed to keep those dimensions connected.</p></div>
        <div className={styles.ledger}>{lenses.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sectionMuted}`}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Structural understanding</p><h2>Nominal diversification can conceal economic concentration.</h2></div><div className={styles.prose}><p>Different positions can depend on the same geography, sector, currency, counterparty, financing condition or other common driver. A holding-level view may appear diversified while the underlying economic structure is not.</p><p>Portfolio Intelligence is designed to surface the relationships represented by the operating model so concentration can be examined across more than one dimension.</p><p>The purpose is not to manufacture alerts or conclusions. It is to make materiality easier to recognize and easier to investigate.</p></div></div>
        <div className={styles.ledger}>{questions.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={styles.darkSection}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow">Operating relationship</p><h2>Portfolio Intelligence gives the other products a common analytical surface.</h2></div><div className={styles.darkProse}><p>Capital Account records how capital enters, moves through and exits the operating environment. Treasury establishes liquidity, reserves and readiness. Allocation expresses intended structure. Portfolio Intelligence shows what that capital has become and how its components relate.</p><p>That continuity allows an observation to be examined against the wider capital system without converting interpretation into recommendation, provider fact or executed outcome.</p></div></div>
        <div className={styles.systemLine} aria-label="Neptlium product operating model"><div><span>01 · Capital Account</span><strong>Capital moves.</strong></div><div><span>02 · Treasury</span><strong>Liquidity establishes capacity.</strong></div><div><span>03 · Allocation</span><strong>Intent defines structure.</strong></div><div><span>04 · Portfolio Intelligence</span><strong>Relationships reveal consequence.</strong></div></div>
      </div>
    </section>

    <section className={styles.section}>
      <div className="web-shell"><div className={styles.statement}><p className="web-eyebrow on-light">Institutional memory</p><h2>Understand how the portfolio became what it is.</h2><p>A current-state portfolio view is only one frame. Institutional understanding also depends on knowing what changed, when it changed and what reasoning or movement produced the present structure.</p><p>Portfolio Intelligence is designed so context can increasingly live with the operating record rather than solely inside meetings, inboxes, spreadsheets or individual memory.</p><p>That turns the portfolio from a snapshot into an evolving system whose structure can be interrogated over time.</p><p className={styles.statementQuote}>Know what you own. Understand what it means.</p></div></div>
    </section>

    <section className={styles.darkSection}>
      <div className="web-shell"><div className={styles.split}><div><p className="web-eyebrow">Decision support</p><h2>Intelligence should narrow uncertainty, not manufacture certainty.</h2></div><div className={styles.darkProse}><p>Portfolio Intelligence is designed to improve the environment in which judgment operates. It can structure evidence, reveal relationships and make significant change easier to examine.</p><p>It does not replace investment judgment or turn derived analysis into authoritative financial state. The system provides context. The institution retains judgment.</p></div></div></div>
    </section>

    <section className={styles.close}><div className={`web-shell ${styles.closeGrid}`}><h2>Turn portfolio ownership into structured understanding.</h2><Link className="text-arrow-link" href="/products/performance">Continue to Performance <ArrowRight aria-hidden="true" /></Link></div></section>
  </main>;
}
