import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from '../product-depth.module.css';

export const metadata = createPageMetadata({
  title: 'Capital Account — Governed Capital Movement | Neptlium',
  description: 'Neptlium Capital Account gives funding and capital movement a governed operating context across purpose, lifecycle, evidence and downstream portfolio meaning.',
  path: '/products/capital-account',
});

const operatingRecord = [
  ['Available context', 'Understand the capital picture around an account without reducing it to a single balance or provider observation.'],
  ['Movement purpose', 'Keep funding and movement activity attached to the reason it exists: an entity, obligation, allocation, transfer or other governed capital objective.'],
  ['Lifecycle state', 'Requested, reviewed, authorized, submitted, settled and reconciled remain distinct claims rather than being flattened into “moved.”'],
  ['Evidence and provenance', 'Preserve where a movement observation came from and what authority that evidence carries before it becomes part of the wider operating record.'],
] as const;

const relationships = [
  ['Treasury', 'Capital movement changes the liquidity picture and can alter reserves, readiness and future obligations.'],
  ['Allocation', 'Funding can support an intended capital structure, but movement alone does not establish allocation intent or approval.'],
  ['Portfolio Intelligence', 'Movement becomes more meaningful when its effect on ownership, exposure and portfolio structure remains visible.'],
] as const;

export default function CapitalAccountPage() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={`web-shell ${styles.heroGrid}`}>
        <div><p className="web-eyebrow on-light">01 · Capital Account</p><h1>Capital, with somewhere to operate.</h1></div>
        <div className={styles.heroLead}>
          <p><strong>Capital Account gives funding and capital movement a governed operating context.</strong></p>
          <p>Instead of treating movement as an isolated transaction, Neptlium connects capital activity to its purpose, lifecycle, evidence and the wider portfolio state it affects.</p>
          <p>The result is not simply a record that capital moved. It is a record of <strong>why it moved, where it belongs and what that movement changes.</strong></p>
          <Link className="text-arrow-link" href="/products">All products <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="capital-record-title">
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Operating record</p><h2 id="capital-record-title">Know where capital stands—and how it arrived there.</h2></div><p className={styles.sectionIntro}>Capital movement becomes institutionally useful when account context, purpose, state and evidence survive every handoff. Capital Account is designed to preserve that continuity.</p></div>
        <div className={styles.ledger}>{operatingRecord.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sectionMuted}`}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow on-light">Movement with context</p><h2>Funding activity should remain attached to its purpose.</h2></div><div className={styles.prose}><p>A deposit, withdrawal or transfer can have very different operating meaning depending on the entity, obligation, strategy or allocation it supports.</p><p>Capital Account is designed so movement context does not disappear into an activity feed. The movement remains connected to the capital system around it.</p><p>This creates a more durable institutional record: not merely a chronology of transactions, but a traceable relationship between capital movement and the decisions or requirements that produced it.</p></div></div>
      </div>
    </section>

    <section className={styles.darkSection}>
      <div className="web-shell">
        <div className={styles.split}><div><p className="web-eyebrow">Connected responsibility</p><h2>Movement changes the operating picture around it.</h2></div><div className={styles.darkProse}><p>Capital Account does not absorb Treasury, Allocation or Portfolio Intelligence. It gives them a movement-oriented operating record they can interpret within their own responsibility.</p><p>Visibility into capital does not itself authorize its use. Consequential action remains dependent on the applicable authenticated workflow, permissions, provider capability and verified state.</p></div></div>
        <div className={styles.relationshipList}>{relationships.map(([title, body], index) => <article key={title}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      </div>
    </section>

    <section className={styles.section}>
      <div className="web-shell"><div className={styles.statement}><p className="web-eyebrow on-light">Institutional continuity</p><h2>Preserve the record behind the movement.</h2><p>Institutional memory weakens when the reason behind capital activity survives only in inboxes, meetings or spreadsheets. Capital Account is designed to keep purpose, lifecycle and evidence closer to the movement itself.</p><p className={styles.statementQuote}>Capital should never move without context.</p></div></div>
    </section>

    <section className={styles.close}><div className={`web-shell ${styles.closeGrid}`}><h2>Give every capital movement an operating meaning.</h2><Link className="text-arrow-link" href="/products/treasury">Continue to Treasury <ArrowRight aria-hidden="true" /></Link></div></section>
  </main>;
}
