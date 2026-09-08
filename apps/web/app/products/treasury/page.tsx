import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from '../product-depth.module.css';

export const metadata = createPageMetadata({
  title: 'Treasury — Liquidity, Reserves and Readiness | Neptlium',
  description: 'Neptlium Treasury places liquidity, reserves, commitments and capital readiness inside the wider operating context without confusing visibility with authority.',
  path: '/products/treasury',
});

const readinessStates = [
  ['Observed', 'What current evidence supports about liquidity or balance state.'],
  ['Reserved', 'Capital associated with a defined requirement, policy or operating purpose.'],
  ['Committed', 'Capital already spoken for by an obligation or expected use.'],
  ['Available', 'Capital that may be usable subject to timing, constraints and applicable provider state.'],
  ['Ready', 'A stronger conclusion that depends on the requirements, permissions and consequential path—not visibility alone.'],
] as const;

const questions = [
  ['Capacity', 'What capital may be available to support the work under consideration?'],
  ['Obligations', 'What known or expected requirements could constrain that capacity?'],
  ['Coverage', 'How do reserves and liquidity relate to those requirements?'],
  ['Readiness', 'Is the organization positioned to act without treating a visible balance as permission?'],
] as const;

export default function TreasuryPage() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={`web-shell ${styles.heroGrid}`}>
        <div><p className="web-eyebrow on-light">02 · Treasury</p><h1>Liquidity is a position. Read it continuously.</h1></div>
        <div className={styles.heroLead}>
          <p><strong>Treasury gives liquidity, reserves and capital readiness a common operating context.</strong></p>
          <p>Instead of treating cash as an isolated balance to inspect, Neptlium is designed to connect liquidity with obligations, allocation intent, capital movement and portfolio state.</p>
          <p>The question moves from <strong>“What is visible?”</strong> to <strong>“What can this capital responsibly support?”</strong></p>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="treasury-states-title">
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Capital readiness</p><h2 id="treasury-states-title">Different liquidity states carry different operating meaning.</h2></div><p className={styles.sectionIntro}>A single number cannot explain whether capital is observed, reserved, committed, available or genuinely ready for a consequential workflow.</p></div>
        <div className={styles.ledger}>{readinessStates.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sectionMuted}`}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Readiness before action</p><h2>See obligations before they become constraints.</h2></div><div className={styles.prose}><p>Capital calls, operating needs, reserves and other requirements can change what liquidity means long before a movement occurs.</p><p>Treasury is designed to keep those demands in the same analytical context as available capital so an organization can reason about capacity before committing it elsewhere.</p><p>The purpose is not to manufacture certainty. It is to make the dependencies around liquidity explicit enough to support better review.</p></div></div>
        <div className={styles.ledger}>{questions.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={styles.darkSection}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow">One operating environment</p><h2>Liquidity should remain connected to the capital system around it.</h2></div><div className={styles.darkProse}><p>Capital Account explains movement. Allocation explains intended structure. Portfolio Intelligence explains composition and exposure. Treasury establishes the liquidity context that constrains or enables what may come next.</p><p>Understanding liquidity is still different from authorizing its use. Neptlium is designed to preserve that boundary throughout the operating lifecycle.</p></div></div>
        <div className={styles.systemLine} aria-label="Treasury operating relationships"><div><span>01</span><strong>Capital movement creates or changes liquidity context.</strong></div><div><span>02</span><strong>Treasury establishes capacity and reserve context.</strong></div><div><span>03</span><strong>Allocation expresses possible capital intent.</strong></div><div><span>04</span><strong>Portfolio context reveals the consequence of structure.</strong></div></div>
      </div>
    </section>

    <section className={styles.section}>
      <div className="web-shell"><div className={styles.statement}><p className="web-eyebrow on-light">Treasury principle</p><h2>Know what capital can do before deciding what it should do.</h2><p>Liquidity is most useful when its purpose, constraints and evidence remain legible. Treasury is designed to make that operating position easier to understand without converting interpretation into authority.</p><p className={styles.statementQuote}>Readiness is more than a balance.</p></div></div>
    </section>

    <section className={styles.close}><div className={`web-shell ${styles.closeGrid}`}><h2>Read liquidity in the context that gives it meaning.</h2><Link className="text-arrow-link" href="/products/allocation">Continue to Allocation <ArrowRight aria-hidden="true" /></Link></div></section>
  </main>;
}
