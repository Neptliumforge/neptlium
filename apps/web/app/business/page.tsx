import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VaultRailCommandVisual, TreasuryStateVisual, PaymentLifecycleVisual, ApprovalPolicyVisual, PreflightVisual, RiskEvidenceVisual, AuditTrailVisual } from '@/components/unified-product-visuals';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Business — VaultRail',
  description: 'VaultRail brings treasury, payments, approvals, policies, risk, reconciliation and audit into one governed business operating environment.',
  path: '/business',
});

export default function BusinessPage() {
  return <div className={styles.page}>
    <section className={styles.journeyHero} aria-labelledby="business-title"><div className={`${styles.shell} ${styles.heroGrid}`}><div className={styles.heroCopy}><div className={styles.productWordmark}><strong>NEPTLIUM</strong><span>VaultRail</span></div><p className={styles.eyebrow}>Business</p><h1 id="business-title">Treasury built for modern operations.</h1><p className={styles.heroLead}>VaultRail brings treasury, payments, approvals, policies, risk, reconciliation and audit into one operating environment.</p><div className={styles.buttonRow}><Link className={`${styles.button} ${styles.buttonPrimary}`} href={SITE.businessAccessUrl}>Request access <ArrowRight aria-hidden="true" /></Link><a className={`${styles.button} ${styles.buttonSecondary}`} href={SITE.businessAppUrl}>Open VaultRail</a></div></div><VaultRailCommandVisual /></div></section>

    <section className={`${styles.section} ${styles.ivory}`} aria-labelledby="treasury-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Treasury</p><h2 id="treasury-title">Know where business liquidity stands.</h2><p>Available, reserved, in-transit and pending-reconciliation states describe different financial realities. Wallet observation alone is not canonical treasury truth.</p><Link className={styles.textAction} href="/treasury">Explore Treasury <ArrowRight aria-hidden="true" /></Link></div><TreasuryStateVisual /></div></section>

    <section className={styles.section} aria-labelledby="payments-title"><div className={`${styles.shell} ${styles.split} ${styles.splitReverse}`}><PaymentLifecycleVisual /><div className={styles.sticky}><p className={styles.eyebrow}>Payments</p><h2 id="payments-title">Move money through a controlled lifecycle.</h2><p>A payment can be drafted, checked, approved, authorized, submitted, settled and reconciled without collapsing those stages into one optimistic status.</p></div></div></section>

    <section className={styles.section} aria-labelledby="approvals-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Approvals</p><h2 id="approvals-title">Authority should be explicit.</h2><p>Who requested a payment, who reviewed it, what policy applied and what remains outstanding should stay visible before financial authority is exercised.</p></div><ApprovalPolicyVisual /></div></section>

    <section className={styles.section} aria-labelledby="policies-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Policies</p><div><h2 id="policies-title">Rules before money moves.</h2><p>Deterministic controls can evaluate amount, wallet, asset, network, counterparty, department, risk context and time. AI should never become the source of payment authority.</p></div></div><div className={styles.featureList}>{['Amount','Wallet','Asset + network','Counterparty'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><p>Policy input stays explainable and reviewable before authorization.</p></div>)}</div></div></section>

    <section className={styles.section} aria-labelledby="preflight-title"><div className={`${styles.shell} ${styles.split} ${styles.splitReverse}`}><PreflightVisual /><div className={styles.sticky}><p className={styles.eyebrow}>Preflight</p><h2 id="preflight-title">Understand the transaction before signing it.</h2><p>Source, destination, asset, network and expected effects should be inspectable before authorization. Simulation can inform a decision; it does not replace policy or approval.</p></div></div></section>

    <section className={styles.section} aria-labelledby="risk-title"><div className={`${styles.shell} ${styles.split}`}><div className={styles.sticky}><p className={styles.eyebrow}>Risk</p><h2 id="risk-title">Show the evidence behind risk.</h2><p>New counterparties, unusual amounts, known contracts, simulation results and unexpected permissions are more useful when the underlying evidence remains visible.</p></div><RiskEvidenceVisual /></div></section>

    <section className={styles.section} aria-labelledby="receivables-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Receivables · Developing</p><div><h2 id="receivables-title">Collect, match and reconcile.</h2><p>Invoice, payment link, received funds, matching, reconciliation and receipt are the intended lifecycle. Public payment infrastructure is represented separately at pay.neptlium.com; availability remains product-state dependent.</p></div></div><div className={styles.sequence}>{['Invoice','Payment link','Received','Matched','Reconciled'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><p>Illustrative lifecycle state.</p></div>)}</div></div></section>

    <section className={styles.section} aria-labelledby="wallets-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>Wallets + accounts</p><div><h2 id="wallets-title">Wallets are infrastructure. Treasury is the product.</h2><p>Root Treasury, Operations, Vendor Payments and Web3 Operations can represent business purposes while signing technology remains a separate infrastructure decision.</p></div></div><div className={styles.featureList}>{['Root Treasury','Operations','Vendor Payments','Web3 Operations'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><p>Purpose-driven account context without implying a specific custody or provider relationship.</p></div>)}</div></div></section>

    <section className={styles.section} aria-labelledby="audit-title"><div className={`${styles.shell} ${styles.split} ${styles.splitReverse}`}><AuditTrailVisual /><div className={styles.sticky}><p className={styles.eyebrow}>Audit</p><h2 id="audit-title">Every important action should leave evidence.</h2><p>Payment creation, policy evaluation, approval, wallet authorization, submission, settlement and reconciliation should remain explainable months later.</p></div></div></section>

    <section className={styles.section} aria-labelledby="ai-title"><div className={styles.shell}><div className={styles.sectionHead}><p className={styles.eyebrow}>AI · Concept</p><div><h2 id="ai-title">Intelligence without authority.</h2><p>Where intelligent assistance is introduced, its role must remain bounded. This is a product principle, not a claim that every capability shown is currently live.</p></div></div><div className={styles.aiRules}><div><h3>AI may</h3><ul><li>Explain</li><li>Summarize</li><li>Detect</li><li>Prepare</li><li>Recommend</li></ul></div><div><h3>AI may not</h3><ul><li>Approve</li><li>Sign</li><li>Override policy</li><li>Change ledger truth</li><li>Modify audit history</li></ul></div></div></div></section>

    <section className={styles.disclosure} aria-label="Business product disclosure"><div className={styles.shell}><p>{DISCLOSURES.business}</p></div></section>
  </div>;
}
