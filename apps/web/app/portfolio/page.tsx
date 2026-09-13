import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import styles from '../product-pages.module.css';

export const metadata = createPageMetadata({
  title: 'Portfolio — Neptlium',
  description: 'Understand portfolio structure, exposure, composition and change over time with calm financial context.',
  path: '/portfolio',
});

export default function PortfolioPage() {
  return <div className={styles.page}>
    <section className={`${styles.hero} ${styles.white} ${styles.lightHeaderHero}`} aria-labelledby="portfolio-page-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Portfolio</p>
          <h1 id="portfolio-page-title">See what makes up your portfolio.</h1>
          <p className={styles.heroLead}>Understand composition, exposure and relationships as one financial position — without reducing the portfolio to a single performance number.</p>
          <div className={styles.actions}><Link className={`${styles.button} ${styles.buttonDark}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link><Link className={styles.button} href="/allocation">Explore Allocation</Link></div>
        </div>
        <div className={styles.portfolioCanvas} aria-label="Illustrative portfolio composition map">
          <span className={styles.uiLabel}>Portfolio composition · illustrative</span>
          <div className={styles.portfolioMap}>
            <div className={`${styles.orbit} ${styles.orbitA}`} /><div className={`${styles.orbit} ${styles.orbitB}`} /><div className={`${styles.orbit} ${styles.orbitC}`} />
            <div className={`${styles.node} ${styles.nodeA}`}><div><strong>Core</strong><span>Primary exposure</span></div></div>
            <div className={`${styles.node} ${styles.nodeB}`}><div><strong>Growth</strong><span>Directional</span></div></div>
            <div className={`${styles.node} ${styles.nodeC}`}><div><strong>Reserve</strong><span>Liquidity</span></div></div>
            <div className={`${styles.node} ${styles.nodeD}`}><div><strong>Other</strong></div></div>
          </div>
          <div className={styles.portfolioLegend}><span>Category relationship</span><span>Exposure grouping</span><span>Liquidity context</span></div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.cloud}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Composition</p><h2>Read the whole before the individual line items.</h2><p>Portfolio composition should make the shape of a financial position easy to grasp: what is central, what is concentrated, and how the parts relate.</p></div>
        <div className={styles.exposureBand} aria-label="Illustrative portfolio composition dimensions"><div><span className={styles.uiLabel}>Core</span><strong>Foundation</strong><p>Primary exposures that define the broad structure.</p></div><div><span className={styles.uiLabel}>Growth</span><strong>Directional</strong><p>Exposure that changes the portfolio’s character.</p></div><div><span className={styles.uiLabel}>Reserve</span><strong>Liquidity</strong><p>Capital context that sits beside invested exposure.</p></div><div><span className={styles.uiLabel}>Other</span><strong>Relationships</strong><p>Smaller components that still matter to the whole.</p></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.mineral}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Exposure</p><h2>See where the portfolio leans.</h2><p>Exposure becomes more useful when categories, companies and liquidity can be understood as relationships rather than isolated percentages.</p></div>
        <div className={styles.workspace}><div className={styles.workspaceBar}><span>Exposure view</span><span>Illustrative</span></div><div className={styles.workspaceBody}><div className={styles.companyGrid}><div><span className={styles.uiLabel}>Category relationship</span><p className={styles.supportCopy}>Understand where multiple positions express a similar financial idea.</p></div><div><span className={styles.uiLabel}>Concentration context</span><p className={styles.supportCopy}>See where the structure depends more heavily on a smaller set of exposures.</p></div><div><span className={styles.uiLabel}>Company relationship</span><p className={styles.supportCopy}>Move from composition into the companies or assets behind it.</p></div><div><span className={styles.uiLabel}>Liquidity relationship</span><p className={styles.supportCopy}>Keep invested exposure and more liquid capital visible as distinct parts of the position.</p></div></div></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Companies + relationships</p><h2>Move from portfolio structure into what sits underneath it.</h2><Link className={styles.textLink} href="/investments">Explore Investments <ArrowRight aria-hidden="true" /></Link></div>
        <div className={styles.researchStrip}><div className={styles.editorialNote}><span className={styles.uiLabel}>Relationship view</span><h3>A portfolio is more than categories. It is a network of companies, assets and financial intentions.</h3><p>The composition view should make it easy to move between the whole and the context behind each part.</p></div><div className={styles.relationshipList}><div><strong>Category</strong><span>How exposure is grouped.</span></div><div><strong>Company</strong><span>What sits behind the exposure.</span></div><div><strong>Purpose</strong><span>Why it belongs in the structure.</span></div></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Change + activity</p><h2>Understand what changed around the composition.</h2><p>Portfolio history is more useful when structural changes can be connected to the decisions and activity that produced them.</p></div>
        <div className={styles.changeLane}><div><span>Composition</span><strong>Exposure structure reviewed</strong></div><div><span>Activity</span><strong>Portfolio relationship changed</strong></div><div><span>Context</span><strong>Reason remains attached to the record</strong></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.ivory}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Portfolio → Allocation</p><h2>See the position clearly before deciding how it should change.</h2><p>Portfolio describes the composition. Allocation gives that composition an intentional target to review.</p><Link className={styles.textLink} href="/allocation">See Allocation <ArrowRight aria-hidden="true" /></Link></div><div className={styles.editorialNote}><span className={styles.uiLabel}>Decision context</span><h3>Current structure is the starting point — not the recommendation.</h3><p>Neptlium keeps present composition distinct from a modeled or intended arrangement.</p></div></div>
    </section>

    <section className={`${styles.closing} ${styles.ivory}`}><div className={`${styles.shell} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>Neptlium Portfolio</p><h2>See what your financial position actually looks like.</h2></div><div className={styles.actions}><Link className={`${styles.button} ${styles.buttonDark}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <div className={`${styles.disclosure} ${styles.ivory}`}><div className={styles.shell}><p>{DISCLOSURES.general}</p></div></div>
  </div>;
}
