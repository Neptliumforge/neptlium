import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Insights — Neptlium',
  description: 'One Neptlium editorial system for investing, markets, portfolio, capital, treasury, payments, digital assets, risk, companies and technology.',
  path: '/insights',
});

const categories = ['Investing','Markets','Portfolio','Capital','Treasury','Payments','Digital assets','Risk','Companies','Technology'] as const;

export default function InsightsPage() {
  return <div className={styles.page}>
    <section className={styles.journeyHero} data-npt-surface="ivory" aria-labelledby="insights-title"><div className={styles.shell}><div className={styles.heroCopy}><p className={styles.eyebrow}>Insights</p><h1 id="insights-title">One editorial system for capital in motion.</h1><p className={styles.heroLead}>Neptlium publishes research, education and product intelligence across Personal and Business without splitting the company into separate content brands.</p></div></div></section>
    <section className={styles.section} data-npt-surface="white" aria-labelledby="categories-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Editorial categories</p><div><h2 id="categories-title">A shared language across investing and treasury.</h2><p>Categories describe the subject, while audience tags such as Personal or Business may clarify who a piece is most relevant to. No article inventory is fabricated.</p></div></div><div className={styles.capabilityGrid}>{categories.map((category) => <article className={styles.capability} key={category}><span className={styles.pill}>Topic</span><h3>{category}</h3><p>Reserved for substantive Neptlium material when original work is available.</p></article>)}</div></div></section>
    <section className={`${styles.section} ${styles.ivory}`} data-npt-surface="cloud" aria-labelledby="publishing-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Publishing standard</p><div><h2 id="publishing-title">Research should add evidence, not noise.</h2><p>Neptlium does not publish fake authors, fabricated findings, invented dates or placeholder research merely to make the site appear active.</p><Link className={styles.textAction} href="/research">Research archive <ArrowRight aria-hidden="true" /></Link></div></div></div></section>
  </div>;
}
