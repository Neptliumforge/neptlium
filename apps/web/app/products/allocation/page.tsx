import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from '../product-depth.module.css';

export const metadata = createPageMetadata({
  title: 'Allocation — Governed Capital Intent | Neptlium',
  description: 'Neptlium Allocation turns capital intent into an explicit governed structure across targets, constraints, review, authorization and outcome.',
  path: '/products/allocation',
});

const stages = [
  ['Intent', 'Express the capital structure the organization wants to examine without presenting a target as an instruction.'],
  ['Constraints', 'Bring liquidity, portfolio context, capital roles and applicable operating limits into the same model.'],
  ['Scenario', 'Compare possible structures and assumptions while keeping modeled state explicitly non-consequential.'],
  ['Review', 'Examine trade-offs, evidence and divergence from the current portfolio before crossing an authority boundary.'],
  ['Authorization', 'Establish whether the relevant identity, policy and workflow permit consequential work to proceed.'],
  ['Outcome', 'Represent later financial consequence from the evidence that supports it rather than retroactively treating the model as execution.'],
] as const;

const allocationQuestions = [
  ['Target', 'What structure is intended, and at what level of the capital model?'],
  ['Current', 'How does the existing portfolio differ from that intended structure?'],
  ['Drift', 'Where has exposure moved materially away from the model?'],
  ['Capacity', 'What liquidity and capital constraints affect what can realistically be considered?'],
  ['Decision record', 'What reasoning, review and authority produced the next state?'],
] as const;

export default function AllocationPage() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={`web-shell ${styles.heroGrid}`}>
        <div><p className="web-eyebrow on-light">03 · Allocation</p><h1>Turn investment intent into governed capital structure.</h1></div>
        <div className={styles.heroLead}>
          <p><strong>Allocation is where strategy becomes an explicit operating model.</strong></p>
          <p>Define how capital should be structured, compare that intent with current exposure and preserve a disciplined record of how allocation decisions evolve.</p>
          <p>The objective is not simply a target allocation. It is a continuously intelligible relationship between <strong>intent, capital already deployed and decisions still available.</strong></p>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="allocation-model-title">
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Allocation model</p><h2 id="allocation-model-title">Model the desired portfolio without confusing intention with reality.</h2></div><p className={styles.sectionIntro}>Allocation can express capital across the dimensions that matter to the organization—strategies, asset classes, geographies, entities, capital roles or other governed structures—while keeping modeled state distinct from observed state.</p></div>
        <div className={styles.ledger}>{allocationQuestions.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="allocation-lifecycle-title">
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Decision lifecycle</p><h2 id="allocation-lifecycle-title">A governed allocation workflow carries meaning through every handoff.</h2></div><p className={styles.sectionIntro}>The distance between a model and a financial consequence matters. Neptlium is designed to preserve that distance rather than visually collapsing proposal, approval and outcome into one state.</p></div>
        <ol className={styles.sequence}>{stages.map(([title, body], index) => <li key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><div><p>{body}</p></div></li>)}</ol>
      </div>
    </section>

    <section className={styles.darkSection}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow">Portfolio relationship</p><h2>Compare intention with the capital structure that already exists.</h2></div><div className={styles.darkProse}><p>Allocation becomes more useful when the model can be read against composition, concentration, liquidity and capital movement rather than in isolation.</p><p>Portfolio Intelligence can reveal the structure already present. Treasury can establish liquidity constraints. Capital Account can preserve movement context. Allocation uses those relationships to create a more legible decision environment without claiming investment advice or automated execution.</p></div></div>
        <div className={styles.systemLine} aria-label="Allocation operating sequence"><div><span>01</span><strong>Observe the capital structure that exists.</strong></div><div><span>02</span><strong>Model the structure that may be desired.</strong></div><div><span>03</span><strong>Review divergence, constraints and trade-offs.</strong></div><div><span>04</span><strong>Preserve authority and consequence as separate states.</strong></div></div>
      </div>
    </section>

    <section className={styles.section}>
      <div className="web-shell"><div className={styles.statement}><p className="web-eyebrow on-light">Institutional reasoning</p><h2>Preserve why the allocation changed.</h2><p>Allocation decisions often outlive the meeting, spreadsheet or individual who made them. Neptlium is designed to keep intent, evidence, constraints and review closer to the resulting operating record.</p><p>This makes allocation less like a static policy artifact and more like a governed history of how capital structure was considered over time.</p><p className={styles.statementQuote}>Strategy defines the direction. Allocation governs the structure.</p></div></div>
    </section>

    <section className={styles.close}><div className={`web-shell ${styles.closeGrid}`}><h2>Make capital intent explicit before it becomes consequential.</h2><Link className="text-arrow-link" href="/products/portfolio-intelligence">Continue to Portfolio Intelligence <ArrowRight aria-hidden="true" /></Link></div></section>
  </main>;
}
