import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import styles from '../product-pages.module.css';

export const metadata = createPageMetadata({
  title: 'Allocation — Neptlium',
  description: 'Model and review how capital may be arranged without confusing intention with execution.',
  path: '/allocation',
});

const Mix = ({ title, values }: { title: string; values: [string, string, string][] }) => <div className={styles.allocationColumn}><h3>{title}</h3><div className={styles.allocationRows}>{values.map(([label, width, note]) => <div key={label}><i /><span>{label}</span><em>{note}</em><b style={{'--w':width} as React.CSSProperties} /></div>)}</div></div>;

export default function AllocationPage() {
  return <div className={styles.page}>
    <section className={`${styles.hero} ${styles.allocationHero}`} aria-labelledby="allocation-page-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Allocation</p>
          <h1 id="allocation-page-title">Shape how your capital is arranged.</h1>
          <p className={styles.heroLead}>Model a more intentional structure, understand the implications, and keep review separate from execution.</p>
          <div className={styles.actions}><Link className={`${styles.button} ${styles.buttonLight}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link><Link className={`${styles.button} ${styles.buttonLight}`} href="/portfolio">View Portfolio</Link></div>
        </div>
        <div className={styles.allocationBoard} aria-label="Illustrative current and modeled allocation comparison">
          <span className={styles.uiLabel}>Allocation model · illustrative</span>
          <div className={styles.allocationColumns}>
            <Mix title="Current structure" values={[["Core","72%","larger"],["Growth","44%","moderate"],["Reserve","28%","smaller"]]} />
            <div className={styles.allocationArrow} aria-hidden="true">→</div>
            <Mix title="Modeled structure" values={[["Core","58%","balanced"],["Growth","51%","balanced"],["Reserve","39%","higher"]]} />
          </div>
          <div className={styles.allocationDelta}><div><strong>Concentration</strong><span>Understand where the structure is heavier.</span></div><div><strong>Liquidity</strong><span>Keep reserve context visible.</span></div><div><strong>Implication</strong><span>See what a modeled change would affect.</span></div></div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Current structure</p><h2>Start from the portfolio that exists.</h2><p>Allocation begins by understanding current composition, liquidity and concentration. The present structure is evidence to review, not a verdict about what should happen next.</p><Link className={styles.textLink} href="/portfolio">See Portfolio <ArrowRight aria-hidden="true" /></Link></div><div className={styles.editorialNote}><span className={styles.uiLabel}>Current view</span><h3>What is arranged today, where is it concentrated, and how much flexibility does the structure leave?</h3><p>Those questions create a grounded starting point for modeling without implying advice or automatic optimization.</p></div></div>
    </section>

    <section className={`${styles.section} ${styles.cloud}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Modeled structure</p><h2>Turn intention into a structure you can inspect.</h2><p>A modeled allocation should make the intended differences easy to see before any action is considered.</p></div><div className={styles.allocationBoard}><span className={styles.uiLabel}>Modeled comparison · illustrative</span><div className={styles.allocationDelta}><div><strong>More reserve</strong><span>Illustrates increased liquidity emphasis.</span></div><div><strong>Less concentration</strong><span>Illustrates a broader spread of exposure.</span></div><div><strong>Different balance</strong><span>Illustrates a changed structural intention.</span></div></div></div></div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Liquidity + concentration</p><h2>See the trade-offs inside the arrangement.</h2><p>A different allocation can imply changes to liquidity, concentration and exposure. Neptlium is designed to surface those implications as decision context rather than predicted returns.</p></div><div className={styles.decisionRail}><div><span className={styles.uiLabel}>Liquidity</span><strong>How flexible is the structure?</strong><p>Keep more liquid capital visible beside committed exposure.</p></div><div><span className={styles.uiLabel}>Concentration</span><strong>Where does the structure lean?</strong><p>Understand where fewer exposures carry more structural weight.</p></div><div><span className={styles.uiLabel}>Change</span><strong>What would the model alter?</strong><p>Review the implications before considering action.</p></div></div></div>
    </section>

    <section className={`${styles.section} ${styles.mineralLight}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Decision context</p><h2>Modeling is not execution.</h2><p>Keep the difference between an idea, an approved decision and a completed financial consequence clear throughout the experience.</p></div><div><div className={styles.lifecycle} aria-label="Allocation lifecycle"><span>Model</span><span>Review</span><span>Approve</span><span>Reserve</span><span>Execute</span><span>Reconcile</span></div><p className={styles.supportCopy}>Each stage has a different meaning. A modeled structure expresses intention; it does not move capital or guarantee that an action will occur.</p></div></div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Review + governance</p><h2>Make the decision legible before it becomes an action.</h2></div><div className={styles.researchStrip}><div className={styles.editorialNote}><span className={styles.uiLabel}>Review</span><h3>What changes, why does it change, and what must remain true before action?</h3><p>A governed allocation experience preserves the rationale and keeps modeled intent distinct from financial execution.</p></div><div className={styles.relationshipList}><div><strong>Model</strong><span>Proposed arrangement.</span></div><div><strong>Review</strong><span>Decision context and implications.</span></div><div><strong>Evidence</strong><span>What ultimately happened.</span></div></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Allocation ↔ Portfolio</p><h2>Portfolio shows the composition. Allocation gives it intention.</h2><p>Move between the financial position as it is and a modeled structure under consideration without treating the two as the same state.</p><Link className={styles.textLink} href="/portfolio">Return to Portfolio <ArrowRight aria-hidden="true" /></Link></div><div className={styles.editorialNote}><span className={styles.uiLabel}>Relationship</span><h3>Current and target views belong together — but they should never be confused.</h3><p>The distinction creates clearer financial decisions and a more trustworthy record of change.</p></div></div>
    </section>

    <section className={`${styles.closing} ${styles.carbon}`}><div className={`${styles.shell} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>Neptlium Allocation</p><h2>From insight to intention — without skipping the decision.</h2><p>Model the arrangement, understand the implications, and keep action governed.</p></div><div className={styles.actions}><Link className={`${styles.button} ${styles.buttonLight}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <div className={`${styles.disclosure} ${styles.carbon}`}><div className={styles.shell}><p>{DISCLOSURES.modeling} {DISCLOSURES.general}</p></div></div>
  </div>;
}
