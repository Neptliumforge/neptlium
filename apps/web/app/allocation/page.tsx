import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AllocationLifecycleVisual } from '@/components/unified-product-visuals';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({ title: 'Allocation — Neptlium', description: 'Model, review, approve, reserve, execute and reconcile capital decisions without collapsing distinct lifecycle states.', path: '/allocation' });

export default function AllocationPage(){return <div className={styles.page}><section className={styles.journeyHero} aria-labelledby="allocation-page-title"><div className={styles.shell}><div className={styles.heroCopy}><p className={styles.eyebrow}>Personal · Allocation</p><h1 id="allocation-page-title">Decisions before execution. Evidence after it.</h1><p className={styles.heroLead}>Allocation is a governed lifecycle. Modeling proposes a state; approval grants authority; execution submits an action; reconciliation resolves financial consequence.</p></div></div></section><section className={styles.section}><div className={styles.shell}><AllocationLifecycleVisual /><Link className={styles.textAction} href="/personal">Explore Personal <ArrowRight aria-hidden="true" /></Link></div></section></div>}
