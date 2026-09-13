import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import styles from '../product-pages.module.css';

export const metadata = createPageMetadata({
  title: 'Capital — Neptlium',
  description: 'See accounts, liquidity, movement and financial context together in one personal capital view.',
  path: '/capital',
});

const AccountRow = ({ name, state }: { name: string; state: string }) => (
  <div className={styles.accountRow}><strong>{name}</strong><span>{state}</span></div>
);

export default function CapitalPage() {
  return <div className={styles.page}>
    <section className={`${styles.hero} ${styles.white} ${styles.lightHeaderHero}`} aria-labelledby="capital-page-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Personal capital</p>
          <h1 id="capital-page-title">See your capital as one.</h1>
          <p className={styles.heroLead}>Bring accounts, liquidity, movement and financial context into a clearer view of the resources around you.</p>
          <div className={styles.actions}>
            <Link className={`${styles.button} ${styles.buttonDark}`} href={SITE.personalSignUpUrl}>Open account <ArrowRight aria-hidden="true" /></Link>
            <Link className={styles.button} href="/personal">Explore Personal</Link>
          </div>
        </div>
        <div className={styles.workspace} aria-label="Illustrative personal capital workspace">
          <div className={styles.workspaceBar}><span>Capital overview</span><span className={styles.workspaceDots}><span /><span /><span /></span></div>
          <div className={styles.workspaceBody}>
            <div className={styles.capitalOverview}>
              <div className={styles.accountBlock}>
                <span className={styles.uiLabel}>Accounts</span>
                <span className={styles.uiValue}>A connected view</span>
                <div className={styles.accountRows}>
                  <AccountRow name="Everyday liquidity" state="Liquid" />
                  <AccountRow name="Investment reserve" state="Reserved" />
                  <AccountRow name="Opportunity capital" state="Committed" />
                </div>
              </div>
              <div className={styles.capitalStack}>
                <div className={styles.liquidityBlock}>
                  <span className={styles.uiLabel}>Liquidity context</span>
                  <div className={styles.liquidityTrack}><i /></div>
                  <p className={styles.uiMuted}>Illustrative relationship between more liquid and more committed capital.</p>
                </div>
                <div className={styles.contextBlock}>
                  <span className={styles.uiLabel}>Capital context</span>
                  <p className={styles.uiMuted}>Accounts, intended use and recent movement stay close enough to understand together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.cloud}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.eyebrow}>Accounts + liquidity</p>
          <h2>Know what each part of your capital is for.</h2>
          <p>A capital view should make relationships legible: what is liquid, what is set aside, and what is already connected to a financial decision.</p>
        </div>
        <div className={styles.capitalContext} aria-label="Illustrative capital context">
          <div><span className={styles.uiLabel}>Access</span><strong>Liquidity in context</strong></div>
          <div><span className={styles.uiLabel}>Purpose</span><strong>Intent beside capital</strong></div>
          <div><span className={styles.uiLabel}>Relationship</span><strong>Accounts seen together</strong></div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.eyebrow}>Movement</p>
          <h2>See what is changing around your capital.</h2>
          <p>Movement gains meaning when it is connected to the account, purpose and surrounding decision instead of appearing as an isolated line item.</p>
        </div>
        <div className={styles.activityBlock}>
          <span className={styles.uiLabel}>Capital activity · illustrative</span>
          <div className={styles.activityList}>
            <div className={styles.activityLine}><i /><div><strong>Capital reserved for review</strong><span>Intent recorded alongside the change</span></div><span>Review</span></div>
            <div className={styles.activityLine}><i /><div><strong>Account relationship updated</strong><span>Context remains attached to the record</span></div><span>Context</span></div>
            <div className={styles.activityLine}><i /><div><strong>Capital released from reserve</strong><span>Continuity stays visible over time</span></div><span>Record</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.eyebrow}>Financial relationships</p>
          <h2>Context turns balances into understanding.</h2>
        </div>
        <div className={styles.researchStrip}>
          <div className={styles.editorialNote}><span className={styles.uiLabel}>Relationship view</span><h3>Accounts are more useful when purpose, liquidity and activity can be read together.</h3><p>Neptlium is designed to keep those relationships visible without collapsing distinct financial states into a single headline number.</p></div>
          <div className={styles.relationshipList}><div><strong>Account</strong><span>Where capital is represented.</span></div><div><strong>Purpose</strong><span>Why capital is being held or considered.</span></div><div><strong>Activity</strong><span>What changed around that capital.</span></div></div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.mineralLight}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Records + continuity</p><h2>Keep the story of capital intact.</h2></div>
        <div className={styles.editorialNote}><span className={styles.uiLabel}>Continuity</span><h3>Financial context should survive the moment that created it.</h3><p>Records, account relationships and capital activity can form a durable history of how resources were arranged and what changed around them.</p></div>
      </div>
    </section>

    <section className={`${styles.closing} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>Neptlium Capital</p><h2>Know where your capital is — and what is happening around it.</h2><p>Move from disconnected financial fragments toward a more coherent personal capital view.</p></div><div className={styles.actions}><Link className={`${styles.button} ${styles.buttonLight}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link></div></div>
    </section>
    <div className={`${styles.disclosure} ${styles.carbon}`}><div className={styles.shell}><p>{DISCLOSURES.general}</p></div></div>
  </div>;
}
