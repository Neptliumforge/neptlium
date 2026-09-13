import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SharedCoreVisual } from '@/components/unified-product-visuals';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Platform — One shared financial system',
  description: 'Understand how Neptlium Personal and Business experiences share identity, authority, evidence, ledger, reconciliation and audit principles.',
  path: '/platform',
});

export default function PlatformPage() {
  return <div className={styles.page}>
    <section className={styles.journeyHero} data-npt-surface="carbon" aria-labelledby="platform-title"><div className={styles.shell}><div className={styles.heroCopy}><p className={styles.eyebrow}>Platform</p><h1 id="platform-title">One shared financial system underneath.</h1><p className={styles.heroLead}>Neptlium serves invested capital and operational capital through two product journeys built on one control philosophy.</p><div className={styles.buttonRow}><Link className={`${styles.button} ${styles.buttonPrimary}`} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link><Link className={`${styles.button} ${styles.buttonSecondary}`} href="/business">Explore Business</Link></div></div></div></section>

    <section className={styles.section} data-npt-surface="cloud" aria-labelledby="map-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Product family</p><div><h2 id="map-title">Personal and Business above one shared core.</h2><p>The customer experience changes with the job to be done. The underlying expectations around identity, authority, evidence, reconciliation and audit do not.</p></div></div><div data-npt-product-canvas="dark"><div className={styles.platformMap}><section><p className={styles.eyebrow}>Personal</p><h3>Neptlium Capital</h3><ul><li>Capital</li><li>Portfolio</li><li>Allocation</li><li>Investments</li><li>Activity + documents</li></ul></section><section><p className={styles.eyebrow}>Business</p><h3>VaultRail</h3><ul><li>Treasury</li><li>Payments</li><li>Approvals</li><li>Policies + risk</li><li>Audit</li></ul></section><div className={styles.platformCore}><h3>Shared Neptlium core</h3><SharedCoreVisual compact /></div></div></div></div></section>

    <section className={`${styles.section} ${styles.ivory}`} data-npt-surface="white" aria-labelledby="principles-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Operating principles</p><div><h2 id="principles-title">The same words should mean the same thing everywhere.</h2><p>Modeled does not mean executed. Submitted does not mean settled. Settled does not mean reconciled. Provider evidence does not become canonical financial truth merely because it is visible.</p></div></div><div className={styles.featureList}>{[['Identity','Know who is acting.'],['Authority','Know what they are allowed to do.'],['Evidence','Preserve what happened and why.'],['Reconciliation','Resolve financial consequence explicitly.']].map(([title, body], index) => <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong><p>{body}</p></div>)}</div></div></section>

    <section className={styles.section} data-npt-surface="mineral" aria-labelledby="platform-cta-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Choose a journey</p><div><h2 id="platform-cta-title">The platform stays coherent as the customer changes.</h2><p>Personal prioritizes capital clarity and investment context. Business prioritizes treasury control and operational authority. Both remain unmistakably Neptlium.</p></div></div></div></section>
  </div>;
}
