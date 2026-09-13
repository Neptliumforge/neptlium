import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import styles from './insights.module.css';

export const metadata = createPageMetadata({
  title: 'Insights — Capital, Markets and Operating Context | Neptlium',
  description: 'Neptlium Insights organizes clear thinking about capital, companies, treasury, markets, risk and financial operations without inventing publication volume.',
  path: '/insights',
});

const domains = [
  ['Personal capital', 'Frameworks for understanding liquidity, concentration, allocation and the role each part of a portfolio is meant to play.'],
  ['Business finance', 'Clearer ways to think about operating cash, obligations, funding decisions and financial visibility inside a company.'],
  ['Treasury', 'Context for liquidity, reserves, timing, movement and the controls that sit around consequential financial actions.'],
  ['Markets & companies', 'Ways to separate observable facts, changing conditions and interpretation when assessing companies and market structure.'],
  ['Risk & control', 'Practical thinking about authority, evidence, operational risk and the difference between an event being visible and being final.'],
  ['Product thinking', 'How Neptlium reasons about financial software, product boundaries and the representation of uncertainty and state.'],
] as const;

export default function InsightsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="insights-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Neptlium Insights</p>
          <h1 id="insights-title">Ideas for seeing capital more clearly.</h1>
          <p className={styles.lead}>Editorial context for understanding capital, financial systems, companies, treasury, markets, risk and the decisions that connect them.</p>
        </div>
      </section>

      <section className={styles.featured} aria-labelledby="featured-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Editorial standard</p>
            <h2 id="featured-title">Publish when there is something worth understanding.</h2>
          </div>
          <div className={styles.leadStory}>
            <div>
              <p className={styles.label}>Current library</p>
              <h3>Substantive authored Insights are not yet published.</h3>
            </div>
            <p>Rather than fill this space with invented authors, dates or market commentary, Neptlium keeps the editorial structure visible and waits for original work that can be dated, sourced and reviewed on its own merits.</p>
          </div>
        </div>
      </section>

      <section className={styles.domains} aria-labelledby="domains-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Editorial domains</p>
            <h2 id="domains-title">What should become easier to understand?</h2>
            <p>Each domain is defined by a recurring financial question, not by a need to populate a content grid.</p>
          </div>
          <div className={styles.domainList}>
            {domains.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.method} aria-labelledby="method-title">
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Reading standard</p>
            <h2 id="method-title">Fact, evidence and interpretation should not blur together.</h2>
          </div>
          <div className={styles.methodCopy}>
            <p>Neptlium Insights is designed to distinguish reported facts, system states, model output, scenarios, estimates and editorial interpretation. That separation matters most when a subject is uncertain or financially consequential.</p>
            <p>Nothing published here should be read as individualized financial, investment, legal or tax advice.</p>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.shellGrid}>
          <div>
            <p className={styles.eyebrow}>Continue learning</p>
            <h2>Start with the platform concepts already documented.</h2>
          </div>
          <div className={styles.links}>
            <Link href="/learn">Investor education <ArrowRight aria-hidden="true" /></Link>
            <Link href="/security">Security and authority <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
