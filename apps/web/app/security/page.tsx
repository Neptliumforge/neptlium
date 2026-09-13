import Link from 'next/link';
import { ArrowRight, CheckCircle2, KeyRound, RefreshCcw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { SecurityFlowVisual } from '@/components/product-visuals';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../marketing-platform.module.css';

export const metadata = createPageMetadata({
  title: 'Security — Financial Controls and Account Protection | Neptlium',
  description: 'Understand how Neptlium separates authenticated access, server-side authority, transaction state, financial evidence and operational review without overstating undocumented controls.',
  path: '/security',
});

const controlLayers = [
  ['Authenticated access', 'Customer access begins with authenticated identity and a server-verified session. Authentication establishes who is present; it does not by itself authorize a financial consequence.'],
  ['Authorization boundaries', 'Roles, ownership, policy and resource state remain server-enforced considerations before sensitive work may proceed.'],
  ['Financial authority', 'Browser interactions can express intent, but canonical financial state belongs to the responsible server-side systems and governed workflows.'],
  ['Evidence and reconciliation', 'Provider evidence, canonical state and reconciliation remain distinct so an observed event is not silently presented as final financial truth.'],
] as const;

const transactionControls = [
  ['Intent', 'A customer or operator instruction is represented as an explicit request rather than an assumed settlement.'],
  ['Review', 'Consequential workflows preserve review and policy boundaries where those controls are implemented.'],
  ['State transition', 'Requested, authorized, submitted, settled and reconciled states are not collapsed into one generic success state.'],
  ['Record', 'Relevant activity is designed to remain attributable and inspectable across its lifecycle.'],
] as const;

export default function SecurityPage() {
  return (
    <div className={`${styles.scope} mp-home`}>
      <section className="mp-hero" aria-labelledby="security-title">
        <div className="mp-shell mp-hero-grid">
          <div className="mp-hero-copy">
            <p className="mp-kicker">Security & financial integrity</p>
            <h1 id="security-title">Security designed into the financial system.</h1>
            <p className="mp-hero-lead">Neptlium treats account protection, authorization, financial state, provider evidence and operational review as separate responsibilities that must remain explicit as capital moves.</p>
            <div className="mp-actions">
              <Link className="mp-button mp-button-primary" href="/platform">Explore the Platform <ArrowRight aria-hidden="true" /></Link>
              <Link className="mp-button mp-button-secondary" href={SITE.signUpUrl}>Create Account</Link>
            </div>
          </div>
          <div className="mp-hero-product" aria-label="Neptlium security control demonstration"><SecurityFlowVisual /></div>
        </div>
      </section>

      <section className="mp-trust-band" aria-labelledby="account-security-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Account security</p>
            <h2 id="account-security-title">Identity establishes access. Authority remains a separate decision.</h2>
            <p>Security begins by keeping authentication, account ownership and consequential permission distinct instead of treating a signed-in browser as the financial control plane.</p>
          </div>
          <div className="mp-trust-grid">
            {controlLayers.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mp-section" aria-labelledby="authority-title">
        <div className="mp-shell mp-split">
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Financial authority</p>
            <h2 id="authority-title">A click can request an action. It cannot manufacture financial truth.</h2>
            <p>Consequential actions are processed through server-side boundaries that evaluate the identity, ownership, permissions, policy and current state relevant to the operation. Client presentation is intentionally not authoritative financial state.</p>
          </div>
          <div className="mp-reporting-visual" aria-label="Financial authority principles">
            <div><KeyRound aria-hidden="true" /><span>Authenticated identity</span></div>
            <div><ShieldCheck aria-hidden="true" /><span>Server-enforced authority</span></div>
            <div><RefreshCcw aria-hidden="true" /><span>Explicit lifecycle state</span></div>
            <div><CheckCircle2 aria-hidden="true" /><span>Evidence before consequence</span></div>
          </div>
        </div>
      </section>

      <section className="mp-section mp-dark" aria-labelledby="transaction-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Transaction integrity</p>
            <h2 id="transaction-title">Financial workflows should preserve what happened, what is known and what remains unresolved.</h2>
            <p>Neptlium does not treat provider confirmation, settlement and reconciliation as interchangeable. The lifecycle remains explicit so an intermediate state cannot masquerade as finality.</p>
          </div>
          <ol className="mp-journey-list">
            {transactionControls.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="mp-section mp-security" aria-labelledby="operations-title">
        <div className="mp-shell mp-split reverse">
          <div className="mp-security-list">
            <span><ShieldCheck aria-hidden="true" /> Privileged credentials stay outside public client authority.</span>
            <span><RefreshCcw aria-hidden="true" /> Missing capability or unavailable dependencies fail closed instead of simulating success.</span>
            <span><CheckCircle2 aria-hidden="true" /> Relevant state transitions and exceptions remain reviewable by the responsible system.</span>
            <span><TriangleAlert aria-hidden="true" /> No certification, insurance or regulatory status is implied unless separately verified.</span>
          </div>
          <div className="mp-sticky-copy">
            <p className="mp-kicker">Infrastructure & operational controls</p>
            <h2 id="operations-title">Security posture is communicated through boundaries, not slogans.</h2>
            <p>Neptlium separates public presentation from privileged service responsibilities and keeps capability gates explicit. Operational confidence comes from controlled authority, durable state and evidence—not language such as “unhackable” or undefined security superlatives.</p>
          </div>
        </div>
      </section>

      <section className="mp-section mp-reporting" aria-labelledby="responsibility-title">
        <div className="mp-shell">
          <div className="mp-section-heading compact">
            <p className="mp-kicker">Investor responsibility</p>
            <h2 id="responsibility-title">Account security also depends on careful investor behavior.</h2>
            <p>Protect your credentials, review destinations and network information before acting, use only funding routes displayed for your authenticated account, and contact Neptlium support if activity appears suspicious or inconsistent.</p>
          </div>
          <Link className="mp-text-link" href="/contact">Contact Neptlium <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
