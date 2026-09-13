import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import styles from '../product-pages.module.css';

export const metadata = createPageMetadata({
  title: 'Investments — Neptlium',
  description: 'Understand investment exposure, companies, research and activity with more context.',
  path: '/investments',
});

export default function InvestmentsPage() {
  return <div className={styles.page}>
    <section className={`${styles.hero} ${styles.investmentHero}`} aria-labelledby="investments-page-title">
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Investments</p>
          <h1 id="investments-page-title">Invest with more context.</h1>
          <p className={styles.heroLead}>Understand the exposure, companies and ideas behind an investment before reducing the decision to a price or a chart.</p>
          <div className={styles.actions}><Link className={`${styles.button} ${styles.buttonLight}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link><Link className={`${styles.button} ${styles.buttonLight}`} href="/portfolio">Explore Portfolio</Link></div>
        </div>
        <div className={`${styles.workspace} ${styles.carbon}`} aria-label="Illustrative investment research workspace">
          <div className={styles.workspaceBar}><span>Investment context</span><span className={styles.workspaceDots}><span /><span /><span /></span></div>
          <div className={styles.researchPanel}>
            <div className={styles.researchNav}><strong>Research</strong><span>Overview</span><span>Business</span><span>Exposure</span><span>Documents</span><span>Activity</span></div>
            <div className={styles.companyPanel}>
              <div className={styles.companyHead}><div><span className={styles.uiLabel}>Illustrative company view</span><h3>Company context</h3></div><div className={styles.signal} /></div>
              <div className={styles.companyGrid}>
                <div><h4>Business</h4><p>What the company does, where value comes from and which operating relationships matter.</p></div>
                <div><h4>Exposure</h4><p>How the investment relates to a broader financial position without implying a customer holding.</p></div>
              </div>
              <div className={styles.exposureMap} aria-hidden="true"><span style={{height:'34%'}}/><span/><span/><span/><span/><span/><span/></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Investment universe</p><h2>Start with what the exposure represents.</h2><p>Investment context begins with the underlying business, asset or economic relationship — not with a wall of tickers.</p></div>
        <div className={styles.researchStrip}><div className={styles.editorialNote}><span className={styles.uiLabel}>Exposure lens</span><h3>See an investment as part of a wider financial system.</h3><p>Sector, company, asset type and portfolio relationship can help explain what an exposure means without promising an outcome.</p></div><div className={styles.relationshipList}><div><strong>Company</strong><span>Business and operating context.</span></div><div><strong>Asset</strong><span>What the investment represents.</span></div><div><strong>Relationship</strong><span>How it connects to a broader position.</span></div></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.cloud}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Companies + context</p><h2>Understand the company behind the exposure.</h2><p>A clearer investment experience connects company information, material context and supporting records without turning research into a trading terminal.</p></div>
        <div className={styles.workspace}><div className={styles.workspaceBar}><span>Company relationship</span><span>Illustrative</span></div><div className={styles.workspaceBody}><div className={styles.companyGrid}><div><span className={styles.uiLabel}>Business model</span><p className={styles.supportCopy}>Read what creates economic value and which relationships shape the company.</p></div><div><span className={styles.uiLabel}>Investment relationship</span><p className={styles.supportCopy}>Keep the reason for exposure close to the company context that informs it.</p></div><div><span className={styles.uiLabel}>Material context</span><p className={styles.supportCopy}>Surface the questions and records that deserve attention.</p></div><div><span className={styles.uiLabel}>Portfolio connection</span><p className={styles.supportCopy}>Understand how an investment relates to broader composition.</p></div></div></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.ivory}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Research + understanding</p><h2>Research should leave you with a clearer question.</h2></div>
        <div className={styles.editorialNote}><span className={styles.uiLabel}>Research note</span><h3>What drives this investment, what could change the thesis, and how does it relate to the rest of the portfolio?</h3><p>Neptlium’s intended research experience prioritizes understanding over noise: company context, investment relationships, relevant documents and activity in one coherent view.</p></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.carbon}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}>
        <div className={styles.sectionCopy}><p className={styles.eyebrow}>Investment activity</p><h2>Keep decisions connected to what informed them.</h2><p>Research, review and investment activity are more useful when the surrounding context remains legible over time.</p></div>
        <div className={styles.changeLane}><div><span>Research</span><strong>Company context reviewed</strong></div><div><span>Decision context</span><strong>Investment rationale recorded</strong></div><div><span>Portfolio relationship</span><strong>Exposure viewed in composition</strong></div></div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.white}`}>
      <div className={`${styles.shell} ${styles.sectionGrid}`}><div className={styles.sectionCopy}><p className={styles.eyebrow}>Investments → Portfolio</p><h2>An investment makes more sense when you can see what it does to the whole.</h2><Link className={styles.textLink} href="/portfolio">See Portfolio <ArrowRight aria-hidden="true" /></Link></div><div className={styles.editorialNote}><span className={styles.uiLabel}>Connection</span><h3>Investments explain the parts. Portfolio explains the composition.</h3><p>Move from company and exposure context into the structure of the broader financial position without duplicating the same view.</p></div></div>
    </section>

    <section className={`${styles.closing} ${styles.white}`}><div className={`${styles.shell} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>Neptlium Investments</p><h2>Know what you are investing in — and what deserves understanding.</h2></div><div className={styles.actions}><Link className={`${styles.button} ${styles.buttonDark}`} href={SITE.personalSignUpUrl}>Get started <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <div className={`${styles.disclosure} ${styles.white}`}><div className={styles.shell}><p>{DISCLOSURES.investment} {DISCLOSURES.general}</p></div></div>
  </div>;
}
