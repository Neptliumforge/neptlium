import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  ActivityDocumentsVisual,
  AllocationLifecycleVisual,
  CapitalStateVisual,
  GovernanceVisual,
  HeroCapitalVisual,
  PortfolioIntelligenceVisual,
  SystemRevealVisual,
  TreasuryFlowVisual,
} from '@/components/homepage-product-visuals';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './homepage-stage01.module.css';

export const metadata = createPageMetadata({
  title: 'Capital, intelligently managed',
  description: 'Neptlium brings capital, treasury, investments, portfolio intelligence and allocation into one governed financial environment.',
  path: '/',
});

const investmentCapabilities = [
  ['Public markets', 'Informational', 'Market context and investment presentation without implying live brokerage execution.'],
  ['Digital assets', 'Limited', 'Availability depends on supported account, provider, network and operating state.'],
  ['Private opportunities', 'Informational', 'Opportunity presentation is used only when verified offering documentation exists.'],
  ['Cash & treasury', 'Developing', 'Treasury concepts remain distinct from unsupported public USD funding claims.'],
] as const;

const insightTopics = [
  ['Market intelligence', 'Understand market context without turning commentary into a promise.'],
  ['Portfolio perspectives', 'Explore frameworks for ownership, exposure and concentration.'],
  ['Capital management', 'Think more clearly about liquidity, allocation and financial state.'],
  ['Digital assets', 'Separate infrastructure reality from market narrative.'],
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>Neptlium capital platform</p>
            <h1 id="home-title">Capital, intelligently managed.</h1>
            <p className={styles.heroLead}>Neptlium brings capital, treasury, investments, portfolio intelligence and allocation into one governed financial environment.</p>
            <div className={styles.buttonRow}>
              <Link className={`${styles.button} ${styles.primaryButton}`} href={SITE.signUpUrl}>Open account <ArrowRight aria-hidden="true" /></Link>
              <Link className={`${styles.button} ${styles.secondaryButton}`} href="/platform">Explore Neptlium</Link>
            </div>
            <p className={styles.heroNote}>Product visuals on this page are illustrative. They do not represent a real customer account, balance, return history or executed transaction.</p>
          </div>
          <HeroCapitalVisual />
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="system-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>One governed system</p><h2 id="system-title">Capital should move through one coherent operating model.</h2></div>
            <p>Neptlium connects capital state, treasury movement, allocation decisions and portfolio context while preserving the boundaries between modeled intent, authorized action, external evidence and canonical financial consequence.</p>
          </div>
          <SystemRevealVisual />
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`} aria-labelledby="capital-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div className={styles.stickyCopy}>
            <p className={styles.eyebrow}>Capital</p>
            <h2 id="capital-title">Know where your capital stands.</h2>
            <p>Available, reserved and allocated are different states with different consequences. Neptlium is designed to keep those distinctions visible instead of compressing them into a single ambiguous balance.</p>
            <Link className={styles.textAction} href="/products/capital-account">Explore Capital <ArrowRight aria-hidden="true" /></Link>
          </div>
          <CapitalStateVisual />
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="treasury-title">
        <div className={`${styles.shell} ${styles.splitReverse}`}>
          <TreasuryFlowVisual />
          <div className={styles.stickyCopy}>
            <p className={styles.eyebrow}>Treasury</p>
            <h2 id="treasury-title">Move capital with clarity.</h2>
            <p>Funding, settlement, reconciliation and availability are not interchangeable. Neptlium treats each as a distinct lifecycle state and only exposes supported routes through current account capability.</p>
            <Link className={styles.textAction} href="/products/treasury">Explore Treasury <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="investments-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>Investment experience</p><h2 id="investments-title">Understand the opportunity before the action.</h2></div>
            <p>Investment presentation should make objective, structure, exposure, risk, liquidity, documentation and suitability legible before a commitment is made. Availability labels below are deliberately conservative.</p>
          </div>
          <div className={styles.capabilityStrip}>
            {investmentCapabilities.map(([title, status, body]) => <article className={styles.capabilityCard} key={title}><span>{status}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <Link className={styles.textAction} href="/investments">Explore Investments <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`} aria-labelledby="portfolio-title">
        <div className={`${styles.shell} ${styles.splitReverse}`}>
          <PortfolioIntelligenceVisual />
          <div className={styles.stickyCopy}>
            <p className={styles.eyebrow}>Portfolio intelligence</p>
            <h2 id="portfolio-title">See the whole portfolio. Not fragments.</h2>
            <p>Positions, valuation context, allocation, activity and reporting should connect without pretending uncertain or unavailable information is known. The interface stays useful by preserving provenance.</p>
            <Link className={styles.textAction} href="/products/portfolio-intelligence">Explore Portfolio Intelligence <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="allocation-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>Allocation</p><h2 id="allocation-title">Decisions before execution. Evidence after it.</h2></div>
            <p>Neptlium keeps modeling, review, approval, reservation, execution and reconciliation separate so a proposed capital state never masquerades as an executed one.</p>
          </div>
          <AllocationLifecycleVisual />
          <Link className={styles.textAction} href="/products/allocation">Explore Allocation <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="governance-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>Security & financial governance</p><h2 id="governance-title">Financial state should be explainable.</h2></div>
            <p>Identity, authority, execution, evidence and reconciliation are independent control boundaries. Neptlium’s public claims stay inside those boundaries and do not imply certifications, insurance or regulatory status that has not been verified.</p>
          </div>
          <GovernanceVisual />
          <Link className={styles.textAction} href="/security">Explore Security <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`} aria-labelledby="activity-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div className={styles.stickyCopy}>
            <p className={styles.eyebrow}>Activity & documents</p>
            <h2 id="activity-title">Every capital event should leave a record.</h2>
            <p>Funding evidence, settlement, reconciliation, allocation approvals, supported execution and reporting belong to one inspectable history. The lifecycle shown here is illustrative, not a real customer event stream.</p>
          </div>
          <ActivityDocumentsVisual />
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`} aria-labelledby="insights-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>Insights</p><h2 id="insights-title">Intelligence for clearer capital decisions.</h2></div>
            <p>Neptlium publishes market, portfolio and capital perspectives without fabricating research inventory, authorship, performance findings or investment outcomes.</p>
          </div>
          <div className={styles.insightsGrid}>
            <Link className={styles.insightFeature} href="/insights"><span>Neptlium insights</span><h3>Market context with financial discipline.</h3><p>Editorial perspective designed to improve understanding, not simulate a recommendation.</p></Link>
            {insightTopics.map(([title,body]) => <Link className={styles.insightItem} href="/insights" key={title}><span>Perspective</span><h3>{title}</h3><p>{body}</p></Link>)}
          </div>
          <Link className={styles.textAction} href="/insights">Explore Insights <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.disclosure} aria-label="Homepage financial disclosures">
        <div className={`${styles.shell} ${styles.disclosureInner}`}><p>{DISCLOSURES.investment}</p><p>{DISCLOSURES.availability} {DISCLOSURES.modeling}</p></div>
      </section>
    </div>
  );
}
