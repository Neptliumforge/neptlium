import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { InvestCollections } from '@/components/invest-collections';
import { INVEST_FAQS } from '@/lib/content/invest';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './home-elite.module.css';

export const metadata = createPageMetadata({
  title: 'Invest with clarity. Build with confidence.',
  description:
    'Explore investing, understand portfolio context and discover the ideas shaping capital with Neptlium.',
  path: '/',
});

function ProductStage() {
  return (
    <div className={styles.portfolio} aria-label="Illustrative portfolio overview">
      <div className={styles.portfolioBar}>
        <strong>Neptlium / Portfolio</strong>
        <span>Illustrative interface</span>
      </div>
      <div className={styles.portfolioIntro}>
        <span className={styles.eyebrow}>Portfolio overview</span>
        <h3>A perspective on the whole.</h3>
        <p>Composition. Concentration. Context.</p>
      </div>
      <div className={styles.portfolioRows}>
        {[
          ['Positions', 'Understand what you hold.'],
          ['Allocation', 'See how exposures fit together.'],
          ['Activity', 'Keep decisions in context.'],
          ['Records', 'Return to the details that matter.'],
        ].map(([label, copy]) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{copy}</span>
          </div>
        ))}
      </div>
      <p className={styles.note}>
        Illustrative interface only. No customer balances, returns or performance data are shown.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>A clearer perspective on capital</p>
            <h1 id="home-title" data-npt-nts="hero">
              Invest with clarity. Build with confidence.
            </h1>
            <p className={styles.lead}>
              Discover the ideas behind an investment. Understand your portfolio in context. Build a
              more informed relationship with your capital.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href={SITE.personalSignUpUrl}>
                Get started <ArrowRight aria-hidden="true" />
              </a>
              <Link className={styles.secondary} href="/investments">
                Explore investing <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.signature}>Capital, intelligently managed.</p>
          </div>
          <figure className={styles.heroImage}>
            <Image
              src="/invest/compute.webp"
              alt="Server infrastructure in a data center, an editorial view of the systems behind the digital economy"
              fill
              sizes="(max-width: 1080px) 100vw, 50vw"
              preload
            />
            <figcaption>New perspectives / The infrastructure behind intelligence</figcaption>
          </figure>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="portfolio-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>01 / Investment experience & portfolio</p>
            <h2 id="portfolio-title">
              Know where your capital stands. Understand how it’s positioned.
            </h2>
            <p className={styles.lead}>
              A total is only the beginning. Explore the relationship between positions, allocation
              and the decisions behind them.
            </p>
            <Link className={styles.textLink} href="/portfolio">
              Explore your portfolio perspective <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ProductStage />
        </div>
      </section>
      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="explore-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>02 / Explore investing</p>
              <h2 id="explore-title">Discover investments with a clearer view of the details.</h2>
            </div>
            <Link className={styles.textLink} href="/investments">
              All collections <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.sectionLead}>
            Start with the themes shaping the world. Explore their businesses, dependencies and
            risks. Collections are research-only, not investment products.
          </p>
          <InvestCollections compact />
        </div>
      </section>
      <section className={styles.section} aria-labelledby="how-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>03 / How Neptlium works</p>
          <h2 id="how-title">A clearer path from investing to understanding your capital.</h2>
          <ol className={styles.steps}>
            {[
              ['Discover', 'Explore themes, business models and the questions worth asking.'],
              [
                'Understand',
                'Consider objectives, risks, liquidity and the documents behind a decision.',
              ],
              ['Connect', 'See how individual exposures relate to your wider portfolio.'],
            ].map(([title, copy], i) => (
              <li key={title}>
                <span className={styles.stepNumber}>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="why-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>04 / Why Neptlium</p>
            <h2 id="why-title">Built for informed decisions. Designed around your capital.</h2>
            <Link className={styles.textLink} href="/capital">
              Discover Neptlium Capital <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.editorialRows}>
            {[
              [
                'Context before complexity',
                'Start with what an investment represents and why it matters.',
              ],
              [
                'A connected perspective',
                'Consider the parts alongside the composition of the whole.',
              ],
              [
                'Clarity at each step',
                'Keep research, investment decisions and account activity distinct.',
              ],
            ].map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="research-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <figure className={styles.featureImage}>
            <Image
              src="/invest/compute.webp"
              alt="Rows of servers inside a data center"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>Research / Behind the connected economy</figcaption>
          </figure>
          <div>
            <p className={styles.eyebrow}>05 / Research & intelligence</p>
            <h2 id="research-title">Understand the market. See the bigger picture.</h2>
            <p className={styles.lead}>
              From semiconductors and cybersecurity to fintech, industrial automation and healthcare
              technology: follow the relationships behind an idea.
            </p>
            <p>Read the thesis. Challenge the assumptions. Consider what could change.</p>
            <Link className={styles.textLink} href="/investments/global-innovation">
              Explore research themes <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section
        className={`${styles.section} ${styles.tonal}`}
        aria-labelledby="institutional-title"
      >
        <div className={styles.shell}>
          <p className={styles.eyebrow}>06 / Treasury & institutional</p>
          <h2 id="institutional-title">
            Built for personal investing. Extending to complex capital.
          </h2>
          <div className={styles.audienceRows}>
            <Link href="/treasury">
              <div>
                <h3>Treasury</h3>
                <p>
                  Explore the organizational approach to liquidity, approvals and capital
                  operations.
                </p>
              </div>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/institutional">
              <div>
                <h3>Institutional</h3>
                <p>
                  A developing experience for organizations with more complex mandates and reporting
                  needs.
                </p>
              </div>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="trust-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>07 / Trust & transparency</p>
            <h2 id="trust-title">Confidence begins with understanding.</h2>
            <p className={styles.lead}>
              Know what you’re reading, what’s proposed and what requires a closer look.
            </p>
          </div>
          <div className={styles.editorialRows}>
            <article>
              <h3>Clear product distinctions</h3>
              <p>
                Research collections are educational. Proposed plans are concepts. Product access
                requires confirmed terms and eligibility.
              </p>
              <Link className={styles.textLink} href="/investments#plans">
                Review proposed plan families <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Risk in plain sight</h3>
              <p>
                Investing involves uncertainty and possible loss of principal. No research theme or
                allocation approach guarantees an outcome.
              </p>
              <Link className={styles.textLink} href="/risk-disclosure">
                Read the risk disclosures <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Understand the safeguards</h3>
              <Link className={styles.textLink} href="/security">
                Explore security <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="questions-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>08 / Questions & next steps</p>
            <h2 id="questions-title">A clearer way forward.</h2>
            <Link className={styles.textLink} href="/contact">
              Talk to Neptlium <ArrowRight aria-hidden="true" />
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
