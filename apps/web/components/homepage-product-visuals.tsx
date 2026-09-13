import { ArrowDownRight, ArrowRight, Check, CircleDot, FileText, ShieldCheck } from 'lucide-react';
import styles from '@/app/homepage-stage01.module.css';

const demoLabel = <span className={styles.demoLabel}>Illustrative interface</span>;

export function HeroCapitalVisual() {
  return (
    <div className={styles.heroVisual} aria-label="Illustrative Neptlium capital operating interface">
      <div className={styles.heroFrameTop}>
        <span>Capital position</span>{demoLabel}
      </div>
      <div className={styles.heroStateGrid}>
        {['Available', 'Reserved', 'Allocated'].map((label, index) => <div key={label}><span>{label}</span><strong>{index === 0 ? 'Ready' : index === 1 ? 'Controlled' : 'Modeled'}</strong></div>)}
      </div>
      <div className={styles.heroFlow}>
        <div><span>Portfolio intelligence</span><strong>Observed context</strong></div>
        <ArrowRight aria-hidden="true" />
        <div><span>Allocation</span><strong>Review required</strong></div>
      </div>
      <div className={styles.heroTimeline}>
        <span><CircleDot aria-hidden="true" /> Capital state observed</span>
        <span><Check aria-hidden="true" /> Policy boundary intact</span>
      </div>
    </div>
  );
}

export function SystemRevealVisual() {
  const items = [
    ['Capital', 'State'], ['Treasury', 'Movement'], ['Allocation', 'Decision'], ['Portfolio', 'Context'],
  ] as const;
  return <div className={styles.systemReveal} aria-label="Conceptual Neptlium product system">
    {items.map(([title, meta], index) => <div className={styles.systemNode} key={title}><span>0{index + 1}</span><strong>{title}</strong><small>{meta}</small>{index < items.length - 1 && <ArrowRight aria-hidden="true" />}</div>)}
    <div className={styles.systemBase}>Governed financial state · evidence · reconciliation</div>
  </div>;
}

export function CapitalStateVisual() {
  return <div className={styles.productCanvas} aria-label="Illustrative capital state model">
    <header><span>Capital state</span>{demoLabel}</header>
    <div className={styles.capitalBands}>{['Available', 'Reserved', 'Allocated'].map((label, i) => <div key={label}><span>{label}</span><i style={{ width: `${[82,54,34][i]}%` }} /><small>{['Usable within current account state','Held for a governed purpose','Assigned to a modeled or approved intent'][i]}</small></div>)}</div>
  </div>;
}

export function TreasuryFlowVisual() {
  const stages = ['Fund', 'Settle', 'Reconcile', 'Available'];
  return <div className={styles.productCanvas} aria-label="Illustrative treasury lifecycle">
    <header><span>Treasury lifecycle</span><span className={styles.capabilityLabel}>Capability-controlled</span></header>
    <ol className={styles.treasuryFlow}>{stages.map((stage, index) => <li key={stage}><span>0{index + 1}</span><strong>{stage}</strong>{index < stages.length - 1 && <ArrowDownRight aria-hidden="true" />}</li>)}</ol>
    <p className={styles.canvasNote}>A funding instruction is not settlement. Settlement is not reconciliation.</p>
  </div>;
}

export function PortfolioIntelligenceVisual() {
  return <div className={styles.productCanvas} aria-label="Illustrative portfolio intelligence interface">
    <header><span>Portfolio intelligence</span>{demoLabel}</header>
    <div className={styles.portfolioLayers}>{['Positions', 'Valuation context', 'Allocation', 'Activity', 'Reporting'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2,'0')}</span><strong>{item}</strong><i /></div>)}</div>
    <div className={styles.abstractCurve} aria-label="Illustrative non-numeric portfolio context curve"><svg viewBox="0 0 500 130" role="img" aria-hidden="true"><path d="M10 104 C80 88 120 98 170 68 S260 72 310 44 S405 50 490 18" /></svg><span>Non-numeric illustrative trend surface</span></div>
  </div>;
}

export function AllocationLifecycleVisual() {
  const stages = ['MODEL','REVIEW','APPROVE','RESERVE','EXECUTE','RECONCILE'];
  return <div className={styles.allocationVisual} aria-label="Neptlium allocation lifecycle">
    {stages.map((stage,index)=><div key={stage} className={styles.allocationStep}><span>{String(index+1).padStart(2,'0')}</span><strong>{stage}</strong><small>{['Proposed state','Human review','Explicit authority','Capital constraint','Supported action','Canonical consequence'][index]}</small></div>)}
    <p>Modeling does not move capital. Execution remains separate from reconciliation.</p>
  </div>;
}

export function GovernanceVisual() {
  const items = [
    ['Authenticated authority','Identity and session context'],
    ['Controlled execution','Explicit authorization boundaries'],
    ['Immutable evidence','Durable provider and system evidence'],
    ['Reconciliation','Canonical financial consequence'],
  ] as const;
  return <div className={styles.governanceVisual} aria-label="Neptlium financial governance architecture">{items.map(([title,body],index)=><div key={title}><span>{index === 0 ? <ShieldCheck aria-hidden="true" /> : <CircleDot aria-hidden="true" />}</span><strong>{title}</strong><small>{body}</small></div>)}</div>;
}

export function ActivityDocumentsVisual() {
  const events = ['Funding received','Settlement confirmed','Capital reconciled','Allocation approved','Investment executed','Statement generated'];
  return <div className={styles.activityVisual} aria-label="Illustrative capital activity and document lifecycle">
    <div className={styles.activityHeader}><span>Activity & records</span>{demoLabel}</div>
    <ol>{events.map((event,index)=><li key={event}><span>{String(index+1).padStart(2,'0')}</span><i /><strong>{event}</strong>{index === events.length-1 && <FileText aria-hidden="true" />}</li>)}</ol>
  </div>;
}
