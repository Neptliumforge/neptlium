import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './personal.module.css';

export const metadata = createPageMetadata({
  title: 'Personal — Neptlium Capital',
  description: 'See capital, portfolio context, allocation, activity, companies and records in one clear personal financial environment.',
  path: '/personal',
});

const world = [
  ['Capital', 'See the role and state of capital without reducing the experience to one headline balance.'],
  ['Portfolio', 'Understand composition, exposure and relationships across the investments you are reviewing.'],
  ['Allocation', 'See how capital is arranged across categories, liquidity needs and concentration.'],
  ['Activity', 'Follow meaningful changes and keep financial events in context.'],
  ['Companies', 'Connect portfolio exposure with useful company and market context.'],
  ['Documents', 'Keep records close to the capital, activity and decisions they describe.'],
] as const;

export default function PersonalPage() {
  return <div className={styles.personalPage}>
    <section className={styles.hero} data-npt-surface="ivory" aria-labelledby="personal-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Neptlium Personal</p>
          <h1 id="personal-title">See your capital clearly.</h1>
          <p className={styles.heroLead}>Understand where capital sits, how it is arranged, what changed, and what deserves a closer look — without turning your financial life into a trading screen.</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></a>
            <Link className={styles.secondaryAction} href="/platform">Explore the platform</Link>
          </div>
        </div>

        <div className={styles.heroStage} aria-label="Illustrative Neptlium Personal capital workspace">
          <div className={styles.workspace}>
            <aside className={styles.workspaceNav} aria-hidden="true">
              <strong className={styles.workspaceBrand}>Neptlium</strong>
              <ul><li>Capital</li><li>Portfolio</li><li>Allocation</li><li>Activity</li><li>Companies</li><li>Documents</li></ul>
            </aside>
            <div className={styles.workspaceMain}>
              <div className={styles.workspaceTop}><strong>Personal overview</strong><span className={styles.demoTag}>Illustrative interface</span></div>
              <div className={styles.capitalSummary}><span>Your financial picture</span><h3>Capital, portfolio, activity and context together.</h3></div>
              <div className={styles.workspaceGrid}>
                <div>
                  <div className={styles.miniTitle}><span>Allocation context</span><span>Structure</span></div>
                  <div className={styles.allocationBands}><div>Long-term</div><div>Liquid capital</div><div>Other exposure</div></div>
                </div>
                <div>
                  <div className={styles.miniTitle}><span>Recent activity</span><span>Context</span></div>
                  <ul className={styles.activityList}><li>Portfolio record updated</li><li>Document added</li><li>Allocation view reviewed</li></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="white" aria-labelledby="one-view-title">
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>One view</p>
          <h2 id="one-view-title">Everything important, in one place.</h2>
          <p>Capital, investments, activity, documents and financial relationships make more sense when they are viewed together instead of spread across disconnected screens.</p>
        </div>
        <div className={styles.productStage} aria-label="Illustrative connected capital overview">
          <div className={styles.stageTop}><strong>Capital overview</strong><span className={styles.demoTag}>Illustrative</span></div>
          <div className={styles.overviewCanvas}>
            <div className={styles.overviewMain}>
              <p className={styles.overviewStatement}>A clearer view of what you have, what changed, and what it connects to.</p>
              <ul className={styles.contextList}><li><span>Capital</span><strong>State and purpose</strong></li><li><span>Portfolio</span><strong>Composition and exposure</strong></li><li><span>Records</span><strong>Activity and documents</strong></li></ul>
            </div>
            <div className={styles.overviewAside}><div><span>Activity</span><strong>Recent changes</strong></div><div><span>Context</span><strong>Companies</strong></div><div><span>Record</span><strong>Documents</strong></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="cloud" aria-labelledby="portfolio-title">
      <div className={`${styles.shell} ${styles.sectionGrid} ${styles.reverse}`}>
        <div className={styles.productStage} aria-label="Illustrative portfolio composition">
          <div className={styles.stageTop}><strong>Portfolio context</strong><span className={styles.demoTag}>Illustrative structure</span></div>
          <div className={styles.portfolioLayout}>
            <div className={styles.portfolioRow}><div><span>Core exposure</span><strong>Long-term positions and relationships</strong></div><div className={styles.portfolioMarker} style={{ '--marker': '76%' } as React.CSSProperties} /></div>
            <div className={styles.portfolioRow}><div><span>Liquid exposure</span><strong>Capital intended to remain more accessible</strong></div><div className={styles.portfolioMarker} style={{ '--marker': '54%' } as React.CSSProperties} /></div>
            <div className={styles.portfolioRow}><div><span>Other exposure</span><strong>Additional categories requiring context</strong></div><div className={styles.portfolioMarker} style={{ '--marker': '34%' } as React.CSSProperties} /></div>
          </div>
        </div>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>Portfolio</p>
          <h2 id="portfolio-title">Understand what you own.</h2>
          <p>See composition, exposure and relationships without pretending that an illustrative marketing view is a live portfolio statement or a performance report.</p>
          <Link className={styles.textAction} href="/portfolio">Explore Portfolio <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.allocationSection}`} data-npt-surface="mineral" aria-labelledby="allocation-title">
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>Allocation</p>
          <h2 id="allocation-title">See how your capital is arranged.</h2>
          <p>Review how capital is distributed across categories, liquidity needs and concentration. Neptlium can make the structure easier to understand without presenting allocation as advice.</p>
          <Link className={styles.textAction} href="/allocation">Explore Allocation <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className={`${styles.productStage} ${styles.allocationStage}`} aria-label="Illustrative allocation structure">
          <div className={styles.stageTop}><strong>Allocation structure</strong><span>Illustrative categories</span></div>
          <div className={styles.allocationMap}><div><span>Long-term</span><strong>Core</strong></div><div><span>Liquid</span><strong>Accessible</strong></div><div><span>Diversifying</span><strong>Other</strong></div><div><span>Review</span><strong>Context</strong></div></div>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="white" aria-labelledby="activity-title">
      <div className={`${styles.shell} ${styles.sectionGrid} ${styles.reverse}`}>
        <div className={`${styles.productStage} ${styles.activityStage}`} aria-label="Illustrative personal financial activity">
          <div className={styles.stageTop}><strong>Activity</strong><span className={styles.demoTag}>Illustrative timeline</span></div>
          <ol className={styles.timeline}>
            <li><time>Today</time><i aria-hidden="true" /><strong>Portfolio context reviewed</strong><small>Portfolio</small></li>
            <li><time>Recent</time><i aria-hidden="true" /><strong>Document connected to record</strong><small>Documents</small></li>
            <li><time>Earlier</time><i aria-hidden="true" /><strong>Allocation view updated</strong><small>Allocation</small></li>
            <li><time>Record</time><i aria-hidden="true" /><strong>Capital activity preserved</strong><small>Activity</small></li>
          </ol>
        </div>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>Activity</p>
          <h2 id="activity-title">Know what changed.</h2>
          <p>Recent movements, decisions, records and important account events should read as one clear narrative, not a wall of transaction rows.</p>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="ivory" aria-labelledby="companies-title">
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>Companies + context</p>
          <h2 id="companies-title">See the companies behind the exposure.</h2>
          <p>Company context can help connect an investment view with the businesses, sectors and relationships around it. Illustrative examples do not imply that a company is held in any customer portfolio.</p>
        </div>
        <div className={styles.productStage} aria-label="Illustrative company context map">
          <div className={styles.stageTop}><strong>Company context</strong><span className={styles.demoTag}>Illustrative relationships</span></div>
          <div className={styles.companyStage}>
            <div className={styles.companyMap}>
              <div className={styles.companyNode}><span>Public company</span><strong>Business profile</strong></div>
              <div className={styles.companyNode}><span>Fund context</span><strong>Exposure relationship</strong></div>
              <div className={styles.companyNode}><span>Operating company</span><strong>Company context</strong></div>
            </div>
            <div className={styles.companyAside}><span>Context layer</span><p>Understand what sits behind an exposure before treating a ticker, fund or category as the whole story.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="cloud" aria-labelledby="decision-title">
      <div className={styles.shell}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.kicker}>Decision context</p><h2 id="decision-title">More context before the decision.</h2></div>
          <p>Bring portfolio structure, company information, recent activity and relevant records into the same view so decisions can begin with a fuller picture. Context is not financial advice.</p>
        </div>
        <div className={styles.contextGrid}>
          <div className={styles.contextFeature}><span>Portfolio context</span><h3>What does this change mean for the rest of the picture?</h3></div>
          <div className={styles.contextRail}><div><span>Company</span><strong>Understand the business behind the exposure</strong></div><div><span>Activity</span><strong>See what changed recently</strong></div><div><span>Record</span><strong>Keep supporting information close</strong></div></div>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="white" aria-labelledby="documents-title">
      <div className={`${styles.shell} ${styles.sectionGrid} ${styles.reverse}`}>
        <div className={styles.recordStage} aria-label="Illustrative personal financial record">
          <div className={styles.recordHeader}><strong>Financial record</strong><span className={styles.demoTag}>Illustrative</span></div>
          <ul className={styles.recordList}><li><strong>Account record</strong><span>Connected to capital</span></li><li><strong>Statement</strong><span>Connected to period</span></li><li><strong>Activity record</strong><span>Connected to change</span></li><li><strong>Supporting document</strong><span>Connected to context</span></li></ul>
        </div>
        <div className={styles.sectionCopy}>
          <p className={styles.kicker}>Documents + record</p>
          <h2 id="documents-title">Keep the record with the capital.</h2>
          <p>Statements, account records, activity context and supporting documents are easier to understand when they remain connected to the financial picture they describe.</p>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="carbon" aria-labelledby="control-title">
      <div className={`${styles.shell} ${styles.trustGrid}`}>
        <div className={styles.trustCopy}>
          <p className={styles.kicker}>Security + control</p>
          <h2 id="control-title">Your financial view should feel controlled.</h2>
          <p>Identity, access, clear actions and durable records matter because a personal financial environment should make control visible without relying on security theatre.</p>
          <Link className={styles.textAction} href="/security">Explore Security <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className={styles.controlStage} aria-label="Illustrative account control surface">
          <div className={styles.controlHeader}><strong>Account control</strong><span>Illustrative settings</span></div>
          <ul className={styles.controlList}><li><strong>Identity + access</strong><span>Review access state</span></li><li><strong>Sessions</strong><span>See active access</span></li><li><strong>Important actions</strong><span>Clear confirmation</span></li><li><strong>Activity record</strong><span>Keep an auditable record</span></li></ul>
        </div>
      </div>
    </section>

    <section className={styles.section} data-npt-surface="white" aria-labelledby="world-title">
      <div className={`${styles.shell} ${styles.worldLayout}`}>
        <div className={styles.worldIntro}><p className={styles.kicker}>Neptlium Personal</p><h2 id="world-title">One place to keep the picture together.</h2><p>Personal is designed around the financial objects and context an individual needs to understand repeatedly, not a dashboard full of interchangeable widgets.</p></div>
        <ul className={styles.worldList}>{world.map(([title, body]) => <li key={title}><strong>{title}</strong><span>{body}</span></li>)}</ul>
      </div>
    </section>

    <section className={styles.relationship} data-npt-surface="mineral-light" aria-labelledby="relationship-title">
      <div className={`${styles.shell} ${styles.relationshipInner}`}>
        <div><p className={styles.kicker}>Personal × Neptlium</p><h2 id="relationship-title">Personal capital deserves the same clarity as operating capital.</h2><p>Neptlium Personal is the individual side of the wider Neptlium financial system: focused on understanding personal capital, while Business serves a different operating context.</p></div>
        <div className={styles.relationshipNote}><strong>One Neptlium.</strong><p>Different financial contexts, one disciplined approach to clarity, records and control.</p></div>
      </div>
    </section>

    <section className={styles.closing} data-npt-surface="carbon" aria-labelledby="personal-closing-title">
      <div className={`${styles.shell} ${styles.closingInner}`}>
        <div><p className={styles.kicker}>Neptlium Personal</p><h2 id="personal-closing-title">Bring your capital into view.</h2><p>See the whole picture with a calmer, more connected way to understand personal capital.</p></div>
        <div className={styles.actions}><a className={styles.primaryAction} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></a><Link className={styles.secondaryAction} href="/platform">Explore platform</Link></div>
      </div>
    </section>

    <section className={styles.disclosure} data-npt-surface="carbon" aria-label="Investment disclosure"><div className={styles.shell}><p>{DISCLOSURES.investment} {DISCLOSURES.modeling}</p></div></section>
  </div>;
}
