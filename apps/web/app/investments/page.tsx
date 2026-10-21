import Link from 'next/link';
import { InvestCollections } from '@/components/invest-collections';
import { COLLECTIONS, PLAN_FAMILIES, INVEST_FAQS } from '@/lib/content/invest';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../home-elite.module.css';
export const metadata = createPageMetadata({
  title: 'Neptlium Invest — Explore investment themes',
  description:
    'Explore AI, cloud, digital infrastructure, energy and global innovation through research-only collections and proposed plan concepts.',
  path: '/investments',
});
export default function InvestmentsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.discoveryHero}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Neptlium Invest / Discovery</p>
          <h1>Discover investments with a clearer view of the details.</h1>
          <p className={styles.lead}>
            Follow the themes. Understand the businesses. Ask better questions about the risks.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href={SITE.personalSignUpUrl}>
              Get started
            </a>
            <a className={styles.secondary} href="#collections">
              Explore research collections
            </a>
          </div>
          <nav className={styles.collectionNav} aria-label="Investment themes">
            {COLLECTIONS.map((item) => (
              <Link key={item.slug} href={`/investments/${item.slug}`}>
                {item.title}
              </Link>
            ))}
          </nav>
          <p className={styles.note}>
            Research is available to read here. Collections are educational, not purchasable
            products. Account creation does not guarantee investment access.
          </p>
        </div>
      </section>
      <section id="collections" className={`${styles.section} ${styles.tonal}`}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Thematic collections / Research only</p>
          <h2>A world of ideas. A closer look at what’s behind them.</h2>
          <p className={styles.sectionLead}>
            These editorial collections organize questions and risks. They do not represent funds,
            recommendations, customer holdings or available investment products.
          </p>
          <InvestCollections />
        </div>
      </section>
      <section id="plans" className={styles.section}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Proposed plan families / Product concepts</p>
          <h2>Different objectives. Thoughtful starting points.</h2>
          <p className={styles.sectionLead}>
            Reserve, Income, Balanced and Growth are proposed concepts, not available plans. Assets,
            structures, fees, liquidity terms and eligibility are not established in this public
            catalog. No subscription or purchase is offered.
          </p>
          <div className={styles.plans}>
            {PLAN_FAMILIES.map((plan) => (
              <article className={styles.plan} key={plan.name}>
                <span>Proposed · Not available</span>
                <h3>{plan.name}</h3>
                <p>{plan.objective}</p>
                <p>{plan.considerations}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.tonal}`}>
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Before you decide</p>
            <h2>Understanding comes first.</h2>
            <Link className={styles.textLink} href="/risk-disclosure">
              Read the risk disclosures →
            </Link>
          </div>
          <div className={styles.faq}>
            {INVEST_FAQS.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <div className={`${styles.shell} ${styles.disclosure}`}>
        <p>
          {DISCLOSURES.investment} {DISCLOSURES.general}
        </p>
      </div>
    </div>
  );
}
