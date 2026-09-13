import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from './security.module.css';

export const metadata = createPageMetadata({
  title: 'Security — Authority, Access and Financial Control | Neptlium',
  description: 'How Neptlium separates identity, authorization, financial authority, provider evidence, data boundaries and auditability without overstating unsupported controls.',
  path: '/security',
});

const controls = [
  ['Identity & access', 'Authenticated identity establishes who is present. Session and account boundaries are handled separately from permission to create a financial consequence.'],
  ['Authorization', 'Ownership, role, policy and current resource state are evaluated on trusted server boundaries for sensitive operations.'],
  ['Financial authority', 'A browser can express intent. It is not the authority that decides canonical financial state, execution or settlement.'],
  ['Provider boundaries', 'External execution or infrastructure systems remain outside browser authority. Provider observations are treated as evidence until the responsible domain process validates their meaning.'],
  ['Data protection', 'Privileged credentials and service-level secrets stay outside public client code. Missing trusted configuration should fail closed rather than simulate capability.'],
  ['Audit & evidence', 'Important actions and state transitions are designed to remain attributable and reviewable while audit records, ledger records, provider evidence and reconciliation retain distinct meanings.'],
] as const;

export default function SecurityPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="security-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Security</p>
          <h1 id="security-title">Control starts with clear authority.</h1>
          <p className={styles.lead}>Neptlium reduces ambiguity by separating authenticated access, authorization, financial authority, external evidence and canonical financial state.</p>
        </div>
      </section>

      <section className={styles.principle} aria-labelledby="principle-title">
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Core principle</p>
            <h2 id="principle-title">Login does not equal financial authority.</h2>
          </div>
          <div className={styles.prose}>
            <p>Authentication answers who is present. Authorization asks whether that principal may perform a particular action in the current context. Financial authority goes further: consequential state belongs to governed server-side systems, not to what a browser renders or requests.</p>
            <p>This separation is deliberate because visible, approved, submitted, settled and reconciled are different states.</p>
          </div>
        </div>
      </section>

      <section className={styles.controls} aria-labelledby="controls-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Control model</p>
            <h2 id="controls-title">Protection is a set of boundaries, not a slogan.</h2>
          </div>
          <div className={styles.controlList}>
            {controls.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.lifecycle} aria-labelledby="lifecycle-title">
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Financial integrity</p>
            <h2 id="lifecycle-title">Evidence does not become finality by being visible.</h2>
          </div>
          <div className={styles.stateStack} aria-label="Financial state distinctions">
            <span>Requested</span>
            <span>Authorized</span>
            <span>Submitted</span>
            <span>Settled</span>
            <span>Reconciled</span>
          </div>
        </div>
      </section>

      <section className={styles.infrastructure} aria-labelledby="infrastructure-title">
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Infrastructure boundary</p>
            <h2 id="infrastructure-title">Privileged systems stay outside public client authority.</h2>
          </div>
          <div className={styles.prose}>
            <p>Neptlium keeps privileged credentials, provider secrets and service-role capabilities on reviewed server-side boundaries. Public interfaces should receive only the information and actions they are authorized to use.</p>
            <p>Where deployment or infrastructure controls are not publicly verified, this page does not convert implementation assumptions into external security claims.</p>
          </div>
        </div>
      </section>

      <section className={styles.disclosure} aria-labelledby="disclosure-title">
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Reporting</p>
            <h2 id="disclosure-title">A dedicated public vulnerability-reporting program is not represented here unless it is verified.</h2>
          </div>
          <div className={styles.prose}>
            <p>If you need to report a security concern today, use Neptlium’s established contact route and avoid including passwords, private keys, authentication tokens or other sensitive credentials in an initial message.</p>
            <Link href="/contact">Contact Neptlium <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
