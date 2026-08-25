import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operating Platform for Investment Organizations',
  description:
    'Neptlium brings portfolio context, capital movement, treasury and allocation into one clear capital operating platform.',
  path: '/',
});

const operatingSequence = [
  ['01', 'Capital Account', 'Capital enters the operating context.'],
  ['02', 'Treasury', 'Liquidity stays visible in context.'],
  ['03', 'Allocation', 'Intent is shaped before action.'],
  ['04', 'Portfolio Intelligence', 'Decisions return to the whole picture.'],
] as const;

const capabilities = [
  {
    index: '01',
    title: 'Capital Account',
    copy: 'Keep funding and capital movement organized around one operating context.',
    href: '/capital-account',
    signal: 'Movement context',
  },
  {
    index: '02',
    title: 'Treasury',
    copy: 'Understand liquidity alongside the rest of the capital picture.',
    href: '/treasury',
    signal: 'Liquidity context',
  },
  {
    index: '03',
    title: 'Allocation',
    copy: 'Model where capital should go before anything is represented as moved.',
    href: '/allocation',
    signal: 'Intent before action',
  },
  {
    index: '04',
    title: 'Portfolio Intelligence',
    copy: 'Read positions and operating context together rather than in isolation.',
    href: '/portfolio-intelligence',
    signal: 'Whole-picture context',
  },
] as const;

const intelligenceLayers = [
  ['Performance', 'A framework for understanding results without manufacturing certainty.'],
  ['Capital Universe', 'A strategic view of the capital landscape without implying asset availability.'],
  ['Governance', 'Identity, review and authorization stay visible around consequential decisions.'],
] as const;

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
        <div className="web-shell authority-hero-inner">
          <div className="authority-hero-copy">
            <p className="web-eyebrow">Capital operating platform</p>
            <h1 id="home-hero-title">
              <span>Digital capital,</span>
              <span>organized</span>
              <span>around you.</span>
            </h1>
            <p className="authority-hero-lead">
              Neptlium brings capital movement, treasury, allocation and portfolio context into one
              operating environment — so your team can understand what matters before deciding what
              happens next.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="web-button secondary" href={SITE.exploreUrl}>
                {SITE.exploreLabel} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hero-system" aria-label="Illustrative Neptlium operating sequence">
            <div className="hero-system-rule" aria-hidden="true" />
            <ol>
              {operatingSequence.map(([index, title, copy]) => (
                <li key={title}>
                  <span className="hero-system-index">{index}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="hero-system-note">
              System relationship only. No customer balances, transactions or performance data are shown.
            </p>
          </div>
        </div>
      </section>

      <section className="operating-environment" aria-labelledby="environment-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">The operating environment</p>
            <h2 id="environment-title">Capital should not lose context as it moves.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Investment context, liquidity, capital movement and allocation are often separated by
              tools, teams and handoffs. Neptlium is designed to keep those relationships visible.
            </p>
            <p>
              The result is not another dashboard. It is a clearer operating model for understanding
              capital, shaping intent and preserving control around action.
            </p>
          </div>
        </div>
      </section>

      <section className="capital-organization" aria-labelledby="organization-title">
        <div className="web-shell">
          <header className="section-heading system-heading">
            <p className="web-eyebrow on-light">How capital is organized</p>
            <h2 id="organization-title">One system. Distinct responsibilities.</h2>
            <p>
              Each surface has a clear role, but the relationships between them remain visible.
            </p>
          </header>

          <div className="capability-system">
            {capabilities.map((item) => (
              <Link className="capability-row" href={item.href} key={item.title}>
                <span className="capability-index">{item.index}</span>
                <div className="capability-copy">
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <span className="capability-signal">{item.signal}</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-section" aria-labelledby="intelligence-title">
        <div className="web-shell intelligence-grid">
          <div className="intelligence-heading">
            <p className="web-eyebrow">Intelligence and governance</p>
            <h2 id="intelligence-title">Clarity before consequence.</h2>
            <p>
              Neptlium is designed to make the difference between understanding, modeling, reviewing
              and acting visible rather than collapsing them into one moment.
            </p>
          </div>
          <div className="intelligence-list">
            {intelligenceLayers.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reason-section" aria-labelledby="reason-title">
        <div className="web-shell reason-grid">
          <p className="web-eyebrow on-light">Why Neptlium exists</p>
          <div>
            <h2 id="reason-title">Complex capital deserves a simpler operating language.</h2>
            <p>
              Neptlium exists to reduce the distance between knowing where capital stands, understanding
              what should change, and moving forward with the right context and control.
            </p>
          </div>
        </div>
      </section>

      <section className="final-authority" aria-labelledby="final-title">
        <div className="web-shell final-authority-inner">
          <div>
            <p className="web-eyebrow">Neptlium</p>
            <h2 id="final-title">See capital as one connected system.</h2>
          </div>
          <div>
            <p className="authority-hero-lead">
              Enter the operating application or explore how the public platform story fits together.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="web-button secondary" href={SITE.exploreUrl}>
                {SITE.exploreLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
