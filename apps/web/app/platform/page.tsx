import { PageContext } from '@/components/page-context';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SharedCoreVisual } from '@/components/unified-product-visuals';
import { createPageMetadata } from '@/lib/seo';
import styles from '../unified-marketing.module.css';

export const metadata = createPageMetadata({
  title: 'Platform — The Neptlium Capital Operating Platform',
  description:
    'Explore how Neptlium connects Capital, Portfolio, Investments, Treasury, Intelligence and Infrastructure through shared principles of authority and evidence.',
  path: '/platform',
});

const capabilities = [
  ['Capital', 'A clear view of individual capital, accounts and financial context.', '/capital'],
  ['Portfolio', 'Positions, allocation, activity and the context behind them.', '/portfolio'],
  ['Investments', 'Research, investment structure, objectives and risk.', '/investments'],
  ['Treasury', 'Organizational liquidity, payment coordination, policy and oversight.', '/treasury'],
  ['Intelligence', 'Decision support grounded in evidence and context.', '/intelligence'],
  ['Infrastructure', 'Payment surfaces, APIs and developer foundations.', '/infrastructure'],
] as const;

function PlatformPageContent() {
  return (
    <div className={styles.page}>
      <section className={styles.journeyHero} data-npt-surface="carbon" aria-labelledby="platform-title">
        <div className={styles.shell}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>The Neptlium platform</p>
            <h1 id="platform-title">One operating perspective across capital.</h1>
            <p className={styles.heroLead}>
              Neptlium connects personal capital visibility, investment context, organizational
              treasury and financial infrastructure through a consistent approach to authority,
              evidence and operational clarity.
            </p>
            <div className={styles.buttonRow}>
              <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/capital">
                Explore Capital <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/treasury">
                Explore Treasury
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} data-npt-surface="cloud" aria-labelledby="capability-map-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Platform architecture</p>
            <div>
              <h2 id="capability-map-title">Six capabilities. Clear boundaries. Shared principles.</h2>
              <p>
                Each capability serves a distinct financial job. Their shared foundation keeps
                terminology, identity, authority and evidence coherent without collapsing separate
                product responsibilities into one surface.
              </p>
            </div>
          </div>
          <div className={styles.featureList}>
            {capabilities.map(([name, description, href], index) => (
              <div key={name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{name}</strong>
                <p>{description}</p>
                <Link href={href} aria-label={`Explore ${name}`}>
                  Explore <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-npt-surface="white" aria-labelledby="shared-core-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Shared foundation</p>
            <div>
              <h2 id="shared-core-title">One control philosophy underneath.</h2>
              <p>
                Different products may have different workflows and information density. The
                underlying expectations remain consistent: identity establishes who is acting,
                authority governs what may happen, evidence records what is known, and reconciliation
                establishes financial consequence.
              </p>
            </div>
          </div>
          <div data-npt-product-canvas="dark">
            <SharedCoreVisual compact />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.ivory}`} data-npt-surface="white" aria-labelledby="truth-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Financial truth</p>
            <div>
              <h2 id="truth-title">The state of a financial action is never implied.</h2>
              <p>
                Intent is not authorization. Submission is not settlement. Settlement is not
                reconciliation. Provider observation is not canonical ledger state. Neptlium’s
                product language keeps these distinctions explicit.
              </p>
            </div>
          </div>
          <div className={styles.featureList}>
            {[
              ['Identity', 'Know who is acting.'],
              ['Authority', 'Know what they are allowed to do.'],
              ['Evidence', 'Preserve what happened and why.'],
              ['Reconciliation', 'Resolve financial consequence explicitly.'],
            ].map(([title, body], index) => (
              <div key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <Link className={styles.button} href="/trust">
            Explore trust principles <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={styles.section} data-npt-surface="mineral" aria-labelledby="journey-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Choose a journey</p>
            <div>
              <h2 id="journey-title">Start with the financial job to be done.</h2>
              <p>
                Capital prioritizes individual visibility. Treasury prioritizes organizational
                control. Infrastructure describes technical surfaces and developer direction.
                Product availability is stated at the relevant product boundary.
              </p>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/capital">
              Neptlium Capital <ArrowRight aria-hidden="true" />
            </Link>
            <Link className={styles.button} href="/treasury">Neptlium Treasury</Link>
            <Link className={styles.button} href="/infrastructure">Infrastructure</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PlatformPage() {
  return <><PlatformPageContent /><PageContext route="/platform" /></>;
}
