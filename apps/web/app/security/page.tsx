import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SharedCoreVisual, ApprovalPolicyVisual } from '@/components/unified-product-visuals';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Security — Financial authority and integrity',
  description: 'How Neptlium approaches identity, authorization, financial authority, provider boundaries, evidence, reconciliation, audit and data security across Personal and Business.',
  path: '/security',
});

const controls = [
  ['Identity', 'Authenticate the person or system making a request.'],
  ['Authorization', 'Enforce what that principal is allowed to access or initiate.'],
  ['Financial authority', 'Keep consequential financial permission separate from ordinary application access.'],
  ['Provider boundaries', 'Treat provider observation as evidence, not automatic canonical truth.'],
  ['Evidence', 'Preserve durable records of important state transitions.'],
  ['Reconciliation', 'Resolve provider, ledger and operating state explicitly.'],
  ['Audit', 'Retain actor, action, time, entity and request context where required.'],
  ['Data security', 'Protect credentials, transport, secrets and environment boundaries.'],
] as const;

export default function SecurityPage() {
  return <div className={styles.page}>
    <section className={styles.journeyHero} aria-labelledby="security-title"><div className={styles.shell}><div className={styles.heroCopy}><p className={styles.eyebrow}>Security + governance</p><h1 id="security-title">Security is part of financial state.</h1><p className={styles.heroLead}>Neptlium treats identity, authorization, financial authority, evidence, reconciliation and audit as distinct controls across Personal and Business.</p></div></div></section>
    <section className={styles.section} aria-labelledby="security-controls-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Control architecture</p><div><h2 id="security-controls-title">Trust should be visible in how the system behaves.</h2><p>The public site does not claim certifications, guarantees, insurance or regulatory status that have not been verified.</p></div></div><div className={styles.featureList}>{controls.slice(0,4).map(([title, body], index) => <div key={title}><span>{String(index+1).padStart(2,'0')}</span><strong>{title}</strong><p>{body}</p></div>)}</div><div className={styles.featureList}>{controls.slice(4).map(([title, body], index) => <div key={title}><span>{String(index+5).padStart(2,'0')}</span><strong>{title}</strong><p>{body}</p></div>)}</div></div></section>
    <section className={`${styles.section} ${styles.ivory}`} aria-labelledby="shared-security-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Shared core</p><div><h2 id="shared-security-title">Personal and Business share the same financial-integrity principles.</h2><p>Personal emphasizes account authority and canonical financial state. Business adds approval controls and wallet authorization. Both require explicit evidence and reconciliation.</p></div></div><SharedCoreVisual /></div></section>
    <section className={styles.section} aria-labelledby="business-approval-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Business controls</p><h2 id="business-approval-title">Approval is not the same as access.</h2><p>VaultRail separates who can view or prepare an action from who can grant financial authority. Policy logic shown publicly is illustrative, not a claim about a specific customer configuration.</p><Link className={styles.textAction} href="/business">Explore VaultRail <ArrowRight aria-hidden="true" /></Link></div><ApprovalPolicyVisual /></div></section>
  </div>;
}
