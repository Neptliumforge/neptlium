import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PortfolioSystemVisual } from '@/components/unified-product-visuals';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({ title: 'Portfolio — Neptlium', description: 'Portfolio intelligence across positions, valuation context, allocation, activity and reporting.', path: '/portfolio' });

export default function PortfolioPage(){return <div className={styles.page}><section className={styles.journeyHero} aria-labelledby="portfolio-page-title"><div className={`${styles.shell} ${styles.heroGrid}`}><div className={styles.heroCopy}><p className={styles.eyebrow}>Personal · Portfolio</p><h1 id="portfolio-page-title">See the portfolio as one system.</h1><p className={styles.heroLead}>Positions, valuation context, allocation, activity and reporting belong together. Neptlium keeps illustrative and unavailable state distinct from real financial evidence.</p></div><PortfolioSystemVisual /></div></section><section className={styles.section}><div className={styles.shell}><div className={styles.featureList}>{[['Positions','What is held and how it is identified.'],['Valuation context','What valuation evidence is available and when.'],['Allocation','How capital is organized across intended exposures.'],['Reporting','What durable records explain portfolio state.']].map(([title,body],index)=><div key={title}><span>{String(index+1).padStart(2,'0')}</span><strong>{title}</strong><p>{body}</p></div>)}</div><Link className={styles.textAction} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link></div></section></div>}
