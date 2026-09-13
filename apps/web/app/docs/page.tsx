import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from './docs.module.css';

export const metadata = createPageMetadata({
  title: 'Neptlium Documentation',
  description: 'Technical concepts, operating boundaries and current platform contracts for developers and operators working with Neptlium.',
  path: '/docs',
});

const groups = [
  {
    title: 'Start here',
    items: [
      ['Overview', 'Understand Neptlium’s public, application, admin and API boundaries.'],
      ['Getting started', 'Learn the concepts that must be clear before integrating with privileged financial workflows.'],
      ['Authentication', 'Understand identity, session and principal resolution during the current authentication transition.'],
    ],
  },
  {
    title: 'Platform contracts',
    items: [
      ['Authorization', 'Separate authenticated identity from resource ownership, policy and financial authority.'],
      ['Idempotency', 'Design mutation commands so retries do not silently create duplicate financial consequences.'],
      ['Errors', 'Treat unavailable capability, missing durable state and failed verification as explicit failure states.'],
      ['Audit & evidence', 'Keep activity, audit records, provider evidence, ledger state and reconciliation conceptually distinct.'],
    ],
  },
  {
    title: 'Financial systems',
    items: [
      ['Payments', 'Provider evidence and payment-related routes do not establish a live payment product without end-to-end posting and reconciliation.'],
      ['Treasury', 'Treasury concepts cover liquidity, reserves, policy and approvals; the target treasury API is read-only and does not execute transfers.'],
      ['Reconciliation', 'Understand why settlement evidence and canonical reconciled financial state are separate.'],
      ['Webhooks', 'Verified provider events require replay protection, durable ingestion and reviewed provider-specific verification.'],
    ],
  },
] as const;

const runtimeRoutes = [
  'GET /health · GET /v1/health',
  'GET /v1/status · GET /v1/version',
  'POST /v1/account/provision · POST /v1/account/onboarding',
  'GET /v1/capital-account/deposit-address · GET /v1/capital-account/balances',
] as const;

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>Neptlium</Link>
          <span>Documentation</span>
        </div>
      </header>

      <div className={styles.docsShell}>
        <aside className={styles.sidebar} aria-label="Documentation navigation">
          <p>Documentation</p>
          <nav>
            <a href="#overview">Overview</a>
            <a href="#concepts">Core concepts</a>
            <a href="#api">API</a>
            <a href="#authority">Financial authority</a>
          </nav>
        </aside>

        <article className={styles.content}>
          <section className={styles.intro} id="overview">
            <p className={styles.eyebrow}>Developer & operator reference</p>
            <h1>Neptlium Documentation</h1>
            <p>Find the right system boundary, understand the state model, and complete technical work without assuming that a visible route or configured provider is a live financial capability.</p>
            <div className={styles.notice}>Documentation search is not shown until a functional searchable index exists.</div>
          </section>

          <section id="concepts" className={styles.groups}>
            {groups.map((group) => (
              <div className={styles.group} key={group.title}>
                <h2>{group.title}</h2>
                <div className={styles.items}>
                  {group.items.map(([title, body]) => (
                    <div className={styles.item} key={title}>
                      <div><h3>{title}</h3><span className={styles.available}>Available</span></div>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className={styles.reference} id="api">
            <p className={styles.eyebrow}>Current API surface</p>
            <h2>Document routes that exist. Do not infer live capability from route presence.</h2>
            <p>The repository’s current API architecture explicitly distinguishes route presence from production readiness. The sample below is intentionally limited to contracts documented as present in the runtime.</p>
            <div className={styles.codeBlock}>
              <div><span>HTTP</span><span>Current route examples</span></div>
              <pre><code>{runtimeRoutes.join('\n')}</code></pre>
            </div>
          </section>

          <section className={styles.authority} id="authority">
            <p className={styles.eyebrow}>Financial authority</p>
            <h2>Keep the layers separate.</h2>
            <div className={styles.authorityGrid}>
              <div><strong>Authentication</strong><span>Who is present?</span></div>
              <div><strong>Authorization</strong><span>May this principal act on this resource now?</span></div>
              <div><strong>Execution</strong><span>Was an external or internal action actually submitted?</span></div>
              <div><strong>Settlement</strong><span>Did the financial movement reach a settled state?</span></div>
              <div><strong>Reconciliation</strong><span>Does canonical state agree with independent evidence?</span></div>
              <div><strong>Audit</strong><span>Can the important action and decision path be attributed and reviewed?</span></div>
            </div>
          </section>

          <section className={styles.next}>
            <h2>Need the user-facing security model?</h2>
            <Link href="/security">Read Security <ArrowRight aria-hidden="true" /></Link>
          </section>
        </article>
      </div>
    </main>
  );
}
