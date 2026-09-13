import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { UnifiedHeroVisual, SharedCoreVisual, PersonalCapitalVisual, VaultRailCommandVisual, PaymentLifecycleVisual } from '@/components/unified-product-visuals';
import { DISCLOSURES } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'One system for modern capital',
  description: 'Neptlium brings investing, treasury, portfolio intelligence, allocation, payments and financial control into one connected environment for people and businesses.',
  path: '/',
});

const insightTopics = [
  ['Markets', 'Context for understanding market conditions without turning commentary into a promise.'],
  ['Portfolio', 'Frameworks for ownership, exposure, concentration and decision quality.'],
  ['Treasury', 'Operational thinking around liquidity, payments, policy and reconciliation.'],
  ['Risk', 'Explainable financial control for people and businesses.'],
] as const;

export default function HomePage() {
  return <div className={styles.page}>
    <section className={styles.hero} data-npt-surface="carbon" aria-labelledby="home-title"><div className={`${styles.shell} ${styles.heroGrid}`}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>Neptlium</p><h1 id="home-title">One system for modern capital.</h1><p className={styles.heroLead}>Neptlium brings investing, treasury, portfolio intelligence, allocation, payments and financial control into one connected environment.</p><div className={styles.buttonRow}><Link className={`${styles.button} ${styles.buttonPrimary}`} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link><Link className={`${styles.button} ${styles.buttonSecondary}`} href="/business">Explore Business</Link><Link className={`${styles.button} ${styles.buttonGhost}`} href="/platform">See the platform</Link></div></div>
      <UnifiedHeroVisual />
    </div></section>

    <section className={styles.section} data-npt-surface="cloud" aria-labelledby="journeys-title"><div className={styles.shell}><div className={styles.journeyHead}><p className={styles.eyebrow}>Two product journeys</p><div><h2 id="journeys-title">One company. Two ways to operate capital.</h2><p>Personal and Business share the same Neptlium design language and financial-control philosophy. The difference is the work each customer needs to do.</p></div></div><div className={styles.journeyGrid}>
      <article className={styles.journeyCard}><span>Personal · Neptlium Capital</span><h3>See your capital clearly.</h3><p>Track capital, portfolio state, allocation, activity and documents through one governed investment environment.</p><Link className={styles.textAction} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link></article>
      <article className={styles.journeyCard}><span>Business · VaultRail</span><h3>Run treasury with control.</h3><p>Manage treasury, payments, approvals, risk, evidence and audit through a business operating environment built around explicit authority.</p><Link className={styles.textAction} href="/business">Explore Business <ArrowRight aria-hidden="true" /></Link></article>
    </div></div></section>

    <section className={`${styles.section} ${styles.compact}`} data-npt-surface="white" aria-labelledby="core-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Shared core</p><div><h2 id="core-title">One financial system underneath.</h2><p>Both journeys depend on the same principles: identity should be verified, authority should be explicit, financial state should have evidence, and important outcomes should reconcile into an explainable record.</p></div></div><div data-npt-product-canvas="dark"><SharedCoreVisual /></div></div></section>

    <section className={`${styles.section} ${styles.ivory}`} data-npt-surface="ivory" aria-labelledby="personal-preview-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Personal</p><h2 id="personal-preview-title">Built for investors who want more than a balance.</h2><p>Neptlium Capital organizes capital state, portfolio context, allocation decisions, activity and reporting without treating modeled or provider-observed state as canonical financial truth.</p><Link className={styles.textAction} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link></div><div data-npt-product-canvas="dark"><PersonalCapitalVisual /></div></div></section>

    <section className={styles.section} data-npt-surface="mineral" aria-labelledby="business-preview-title"><div className={`${styles.shell} ${styles.split} ${styles.splitReverse}`}><div data-npt-product-canvas="dark"><VaultRailCommandVisual /></div><div className={styles.sticky}><p className={styles.eyebrow}>Business · VaultRail</p><h2 id="business-preview-title">Built for teams responsible for real money.</h2><p>VaultRail brings treasury visibility, payment lifecycle controls, approvals, risk evidence and audit into one business operating environment.</p><Link className={styles.textAction} href="/business">Explore VaultRail <ArrowRight aria-hidden="true" /></Link></div></div></section>

    <section className={styles.section} data-npt-surface="cloud" aria-labelledby="integrity-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Platform integrity</p><div><h2 id="integrity-title">Financial state should be explainable.</h2><p>Intent, authorization, execution, evidence and reconciliation are different moments. Neptlium keeps those distinctions visible across investing and business treasury workflows.</p></div></div><div data-npt-product-canvas="dark"><PaymentLifecycleVisual /></div></div></section>

    <section className={styles.section} data-npt-surface="white" aria-labelledby="insights-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Insights</p><div><h2 id="insights-title">One editorial layer across the product family.</h2><p>Neptlium Insights connects investing, portfolio, capital management, treasury, payments, digital assets, risk, companies and technology without creating separate audience brands.</p></div></div><div className={styles.editorialGrid}><Link href="/insights"><span>Neptlium Insights</span><h3>Financial intelligence for capital in motion.</h3><p>Research and education are published only when substantive original material exists.</p></Link>{insightTopics.map(([title, body]) => <Link href="/insights" key={title}><span>Topic</span><h3>{title}</h3><p>{body}</p></Link>)}</div></div></section>

    <section className={styles.disclosure} data-npt-surface="ivory" aria-label="General disclosure"><div className={styles.shell}><p>{DISCLOSURES.general} {DISCLOSURES.availability}</p></div></section>
  </div>;
}
