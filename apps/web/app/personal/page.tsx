import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PersonalCapitalVisual, PortfolioSystemVisual, AllocationLifecycleVisual, ActivityDocumentsVisual, SharedCoreVisual } from '@/components/unified-product-visuals';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Personal — Neptlium Capital',
  description: 'See capital, portfolio state, allocation, activity and reporting in one governed personal investment environment.',
  path: '/personal',
});

const investmentCapabilities = [
  ['Public markets', 'Informational', 'Market and investment context without implying live brokerage execution.'],
  ['Digital assets', 'Limited', 'Availability depends on supported account, provider, network and operating state.'],
  ['Private opportunities', 'Informational', 'Presented only when verified offering documentation and eligibility context exist.'],
  ['Cash & treasury', 'Developing', 'Treasury concepts remain separate from unsupported public USD funding claims.'],
] as const;

export default function PersonalPage() {
  return <div className={styles.page}>
    <section className={styles.journeyHero} aria-labelledby="personal-title"><div className={`${styles.shell} ${styles.heroGrid}`}><div className={styles.heroCopy}><div className={styles.productWordmark}><strong>NEPTLIUM</strong><span>Capital</span></div><p className={styles.eyebrow}>Personal</p><h1 id="personal-title">Your capital, organized around what is true.</h1><p className={styles.heroLead}>See capital, portfolio state, allocation, activity and reporting in one governed environment.</p><div className={styles.buttonRow}><a className={`${styles.button} ${styles.buttonPrimary}`} href={SITE.personalSignUpUrl}>Open account <ArrowRight aria-hidden="true" /></a><Link className={`${styles.button} ${styles.buttonSecondary}`} href="/platform">Explore the platform</Link></div></div><PortfolioSystemVisual /></div></section>

    <section className={`${styles.section} ${styles.ivory}`} aria-labelledby="capital-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Capital account</p><h2 id="capital-title">Know what is available.</h2><p>Available, reserved and allocated capital are different states. Keeping them distinct makes it easier to understand what can be used, what has been committed, and what is already assigned.</p><Link className={styles.textAction} href="/capital">Explore Capital <ArrowRight aria-hidden="true" /></Link></div><PersonalCapitalVisual /></div></section>

    <section className={styles.section} aria-labelledby="portfolio-title"><div className={`${styles.shell} ${styles.split} ${styles.splitReverse}`}><PortfolioSystemVisual /><div className={styles.sticky}><p className={styles.eyebrow}>Portfolio</p><h2 id="portfolio-title">See the portfolio as one system.</h2><p>Positions, valuation context, allocation, activity and reporting should work together without turning unavailable or modeled information into fabricated performance.</p><Link className={styles.textAction} href="/portfolio">Explore Portfolio <ArrowRight aria-hidden="true" /></Link></div></div></section>

    <section className={styles.section} aria-labelledby="allocation-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Allocation</p><div><h2 id="allocation-title">Decisions before execution.</h2><p>Model, review, approve and reserve before supported execution. Reconciliation remains a separate confirmation that financial consequence has been resolved.</p></div></div><AllocationLifecycleVisual /><Link className={styles.textAction} href="/allocation">Explore Allocation <ArrowRight aria-hidden="true" /></Link></div></section>

    <section className={styles.section} aria-labelledby="investments-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Investment experience</p><div><h2 id="investments-title">Information before investment action.</h2><p>Categories are described conservatively and only as current product truth allows. Availability labels do not imply inventory, execution or suitability.</p></div></div><div className={styles.capabilityGrid}>{investmentCapabilities.map(([title, state, body]) => <article className={styles.capability} key={title}><span className={styles.pill}>{state}</span><h3>{title}</h3><p>{body}</p></article>)}</div><Link className={styles.textAction} href="/investments">Explore Investments <ArrowRight aria-hidden="true" /></Link></div></section>

    <section className={styles.section} aria-labelledby="records-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Activity + documents</p><h2 id="records-title">Every important financial state should have a record.</h2><p>Funding, allocation, execution, reconciliation, statements and confirmations belong close to the capital they describe.</p></div><ActivityDocumentsVisual /></div></section>

    <section className={styles.section} aria-labelledby="personal-security-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Security + control</p><div><h2 id="personal-security-title">Authority and evidence are part of the product.</h2><p>Authenticated authority, controlled execution, durable evidence and reconciliation define a financial control boundary more clearly than generic security claims.</p></div></div><SharedCoreVisual /><Link className={styles.textAction} href="/security">Explore Security <ArrowRight aria-hidden="true" /></Link></div></section>

    <section className={styles.disclosure} aria-label="Investment disclosure"><div className={styles.shell}><p>{DISCLOSURES.investment} {DISCLOSURES.modeling}</p></div></section>
  </div>;
}
