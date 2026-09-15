import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DISCLOSURES } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './home-elite.module.css';

export const metadata = createPageMetadata({
  title: 'Capital, clearly',
  description: 'Neptlium is a financial environment for understanding, coordinating and acting on capital across personal, business and institutional contexts.',
  path: '/',
});

function HeroStage() {
  return <div className={styles.heroStage} aria-label="Illustrative Neptlium financial environment">
    <div className={styles.stageGlow} aria-hidden="true" />
    <div className={`${styles.stageLayer} ${styles.stageBack}`} aria-hidden="true" />
    <div className={`${styles.stageLayer} ${styles.stageMid}`} aria-hidden="true" />
    <div className={`${styles.stageLayer} ${styles.stageFront}`}>
      <div className={styles.stageHeader}><span>Neptlium environment</span><i className={styles.stageSignal} aria-hidden="true" /></div>
      <div className={styles.stageField}>
        <div className={styles.stagePrimary}><span>Financial world</span><strong>Capital with context intact.</strong><div className={styles.trace} aria-hidden="true" /></div>
        <div className={styles.stageSecondary}>
          <div><span>Capital</span><strong>Visible</strong></div>
          <div><span>Activity</span><strong>Connected</strong></div>
          <div><span>Context</span><strong>Clear</strong></div>
        </div>
      </div>
    </div>
    <span className={styles.stageCaption}>Illustrative product environment</span>
  </div>;
}

function WorldStage() {
  return <div className={styles.worldStage} aria-label="Illustrative view of financial contexts resolving into Neptlium">
    <div className={styles.worldAxis} aria-hidden="true" />
    <div className={styles.worldCore}>Neptlium</div>
    <div className={`${styles.worldNode} ${styles.nodeAccounts}`}>Accounts</div>
    <div className={`${styles.worldNode} ${styles.nodeActivity}`}>Activity</div>
    <div className={`${styles.worldNode} ${styles.nodeContext}`}>Market context</div>
    <div className={`${styles.worldNode} ${styles.nodeRecords}`}>Records</div>
  </div>;
}

function ProductStage() {
  return <div className={styles.productStage} aria-label="Illustrative Neptlium product composition">
    <div className={styles.productFrame}>
      <aside className={styles.productRail} aria-label="Illustrative product navigation"><strong>Neptlium</strong><div className={styles.productNav}><span>Overview</span><span>Activity</span><span>Portfolio</span><span>Context</span><span>Documents</span></div></aside>
      <div className={styles.productCanvas}>
        <div className={styles.productBar}><span>Financial overview</span><span>Illustrative interface</span></div>
        <div className={styles.productContent}>
          <section className={styles.productPanel}><small>Capital picture</small><h3>See the shape, not just the total.</h3><div className={styles.productBars} aria-hidden="true"><i /><i /><i /></div></section>
          <div className={styles.productSide}>
            <article><small>Activity</small><strong>Movement stays connected to context.</strong></article>
            <article><small>Portfolio</small><strong>Exposure becomes easier to understand.</strong></article>
            <article><small>Records</small><strong>Important decisions keep their history.</strong></article>
          </div>
        </div>
        <p className={styles.productNote}>Illustrative interface only. No customer balances, returns or performance data are shown.</p>
      </div>
    </div>
  </div>;
}

function SystemMap() {
  return <div className={styles.systemMap} aria-label="Illustrative Neptlium connected financial system">
    <div className={styles.systemRing} aria-hidden="true" />
    <div className={styles.systemCenter}>Neptlium</div>
    <div className={`${styles.systemNode} ${styles.systemPerson}`}>Person or organization</div>
    <div className={`${styles.systemNode} ${styles.systemCapital}`}>Capital</div>
    <div className={`${styles.systemNode} ${styles.systemDecision}`}>Decisions + movement</div>
    <div className={`${styles.systemNode} ${styles.systemRecord}`}>Context + record</div>
  </div>;
}

const families = [
  { label: 'Capital', title: 'Personal wealth in context.', copy: 'Understand portfolio, investments, allocation and activity as one personal financial picture.', href: '/capital', tone: 'personal' },
  { label: 'Treasury', title: 'Operating money, coordinated.', copy: 'Manage organizational liquidity, payments, stablecoins, approvals and financial controls.', href: '/business', tone: 'business' },
  { label: 'Institutional', title: 'Systems for complex capital.', copy: 'A developing environment for funds, family offices and asset managers with deeper mandates and reporting.', href: '/institutional', tone: 'personal' },
  { label: 'Infrastructure', title: 'Build on Neptlium.', copy: 'Pay, API and developer systems designed around explicit financial authority boundaries.', href: '/infrastructure', tone: 'business' },
] as const;

export default function HomePage() {
  return <div className={styles.page}>
    <section className={styles.hero} data-npt-surface="carbon" aria-labelledby="home-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <h1 id="home-title" data-npt-nts="hero">Capital, clearly.</h1>
          <p className={styles.lead} data-npt-nts="lead">One place to understand, coordinate and move through your financial world with context intact.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="#financial-world">Explore Neptlium <ArrowRight aria-hidden="true" /></Link>
            <Link className={styles.secondary} href="/business">For business</Link>
          </div>
        </div>
        <HeroStage />
      </div>
    </section>

    <section id="financial-world" className={`${styles.section} ${styles.cloud}`} data-npt-surface="cloud" aria-labelledby="world-title">
      <div className={styles.shell}>
        <div className={styles.sectionIntro}>
          <h2 id="world-title" className={styles.sectionTitle} data-npt-nts="h2">See your financial world as one.</h2>
          <p>Accounts, capital activity, investments, operating money and financial records should not feel like unrelated systems. Neptlium brings the picture together without flattening the context around it.</p>
        </div>
        <WorldStage />
      </div>
    </section>

    <section className={`${styles.crossroads} ${styles.light}`} data-npt-surface="white" aria-labelledby="crossroads-title">
      <div className={`${styles.shell} ${styles.crossroadsIntro}`}><h2 id="crossroads-title" className={styles.sectionTitle} data-npt-nts="h2">Built for the way capital actually lives.</h2></div>
      <div className={styles.paths}>
        {families.map((family) => <Link className={`${styles.path} ${family.tone === 'personal' ? styles.pathPersonal : styles.pathBusiness}`} href={family.href} key={family.label}>
          <div className={styles.pathVisual} aria-hidden="true" />
          <span className={styles.pathLabel}>{family.label}</span>
          <div><h3 className={styles.pathTitle} data-npt-nts="h3">{family.title}</h3><p className={styles.pathCopy}>{family.copy}</p></div>
          <div className={styles.pathFooter}><span>Explore {family.label}</span><ArrowRight aria-hidden="true" /></div>
        </Link>)}
      </div>
    </section>

    <section className={`${styles.section} ${styles.mineral}`} data-npt-surface="mineral" aria-labelledby="movement-title">
      <div className={styles.shell}>
        <div className={styles.movementIntro}>
          <h2 id="movement-title" className={styles.movementTitle} data-npt-nts="h2">Know what moved. Know what changed.</h2>
          <p>Capital becomes useful when movement, context and decisions remain connected. Neptlium is designed to keep those relationships legible as financial activity unfolds.</p>
        </div>
        <div className={styles.flow} aria-label="Illustrative capital-in-motion sequence">
          <div className={styles.flowLine} aria-hidden="true" />
          <div className={styles.flowItem}><span>Capital</span><strong>Start with what exists.</strong></div>
          <div className={styles.flowItem}><span>Activity</span><strong>See what is moving.</strong></div>
          <div className={styles.flowItem}><span>Context</span><strong>Understand why it matters.</strong></div>
          <div className={styles.flowItem}><span>Record</span><strong>Keep the outcome connected.</strong></div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.cloud}`} data-npt-surface="cloud" aria-labelledby="product-title">
      <div className={styles.shell}>
        <div className={styles.productIntro}>
          <h2 id="product-title" className={styles.productTitle} data-npt-nts="h2">Everything important, in context.</h2>
          <p>Neptlium’s product character is calm, explicit and information-dense without becoming noisy. The interface should help important relationships become easier to see.</p>
        </div>
        <ProductStage />
      </div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`} data-npt-surface="carbon" aria-labelledby="system-title">
      <div className={styles.shell}>
        <div className={styles.systemIntro}>
          <h2 id="system-title" className={styles.systemTitle} data-npt-nts="h2">From understanding to action.</h2>
          <p>Identity, capital, decisions, movement and records belong to the same financial story. Neptlium connects them into a coherent environment without making the homepage read like an architecture document.</p>
        </div>
        <SystemMap />
      </div>
    </section>

    <section className={`${styles.section} ${styles.ivory}`} data-npt-surface="ivory" aria-labelledby="intelligence-title">
      <div className={styles.shell}>
        <div className={styles.intelligenceIntro}>
          <h2 id="intelligence-title" className={styles.intelligenceTitle} data-npt-nts="h2">Context changes the decision.</h2>
          <p>Understanding a financial world means seeing more than a balance: what changed, what it relates to, and which information deserves attention next.</p>
        </div>
        <div className={styles.intelligenceGrid}>
          <div><p className={styles.intelligenceLead}>Useful intelligence should make the picture clearer, not make decisions for you.</p><Link className={`${styles.textLink} ${styles.intelligenceAction}`} href="/insights">Explore Insights <ArrowRight aria-hidden="true" /></Link></div>
          <div className={styles.intelligencePoints}>
            <div><strong>Companies and markets</strong><p>Bring relevant external context closer to the capital it may affect.</p></div>
            <div><strong>Portfolio context</strong><p>See concentration, exposure and activity as parts of one picture.</p></div>
            <div><strong>Capital activity</strong><p>Keep movement understandable without presenting commentary as certainty.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.disclosure} data-npt-surface="ivory" aria-label="General disclosure"><div className={styles.shell}><p>{DISCLOSURES.general}</p></div></section>
  </div>;
}
