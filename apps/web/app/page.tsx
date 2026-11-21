import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, CircleDot, ShieldCheck } from 'lucide-react';
import { InvestCollections } from '@/components/invest-collections';
import { HomeBackground } from '@/components/home-background';
import { INVEST_FAQS } from '@/lib/content/invest';
import { DISCLOSURES } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './home-elite.module.css';

export const metadata = createPageMetadata({
  title: 'Capital, intelligently managed.',
  description:
    'Neptlium is a capital operating platform connecting capital visibility, portfolio context, treasury operations and governed financial movement.',
  path: '/',
});

const capabilities = [
  {
    number: '01',
    name: 'Capital',
    description: 'A clearer view of personal capital, accounts and financial position.',
    href: '/capital',
    note: 'Individual',
  },
  {
    number: '02',
    name: 'Portfolio',
    description: 'Understand positions, allocation, activity and the context behind them.',
    href: '/portfolio',
    note: 'Visibility',
  },
  {
    number: '03',
    name: 'Investments',
    description: 'Explore investment ideas, structures, objectives and associated risks.',
    href: '/investments',
    note: 'Research',
  },
  {
    number: '04',
    name: 'Treasury',
    description: 'Coordinate organizational liquidity, payment intent and approvals.',
    href: '/treasury',
    note: 'Organizations',
  },
  {
    number: '05',
    name: 'Intelligence',
    description: 'Bring evidence and context to the decisions that shape capital.',
    href: '/intelligence',
    note: 'Decision support',
  },
  {
    number: '06',
    name: 'Infrastructure',
    description: 'Explore the systems and developer foundations behind Neptlium.',
    href: '/infrastructure',
    note: 'Developers',
  },
] as const;

function AuthorityStage() {
  return (
    <div className={styles.authorityStage} aria-label="Illustrative financial authority workflow">
      <div className={styles.stageHeader}>
        <div>
          <span className={styles.stageKicker}>The Neptlium principle</span>
          <strong>Movement with authority</strong>
        </div>
        <span className={styles.stageTag}>Illustrative model</span>
      </div>
      <ol className={styles.authoritySteps}>
        <li>
          <span className={styles.authorityNode}><CircleDot aria-hidden="true" /></span>
          <span><strong>Intent</strong><small>Define the requested movement</small></span>
        </li>
        <li>
          <span className={styles.authorityNode}><ShieldCheck aria-hidden="true" /></span>
          <span><strong>Policy & authorization</strong><small>Apply rules and delegated authority</small></span>
        </li>
        <li>
          <span className={styles.authorityNode}><CheckCircle2 aria-hidden="true" /></span>
          <span><strong>Evidence & reconciliation</strong><small>Establish what happened and what is known</small></span>
        </li>
      </ol>
      <p className={styles.stageFootnote}>
        Conceptual workflow only. It does not represent a live payment, settlement or customer account.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${styles.motionHero}`} aria-labelledby="home-title">
        <HomeBackground />
        <div className={`${styles.shell} ${styles.heroGrid} ${styles.motionHeroGrid}`}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>The Capital Operating Platform</p>
            <h1 id="home-title" data-npt-nts="hero">Capital, intelligently managed.</h1>
            <p className={styles.lead}>
              One connected perspective across capital, portfolios, treasury and financial
              infrastructure. Designed to make complex financial operations clearer, more
              deliberate and accountable.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/platform">
                Explore the platform <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.secondary} href="/company">
                About Neptlium <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.signature}>Every movement has authority. Every position has evidence.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capabilities-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>A connected architecture</p>
              <h2 id="capabilities-title">Six capabilities. One operating perspective.</h2>
            </div>
            <Link className={styles.textLink} href="/platform">
              Explore platform architecture <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.sectionLead}>
            Neptlium brings distinct financial journeys into a coherent system. Each capability
            has a clear role, with authority and evidence kept visible throughout.
          </p>
          <div className={styles.capabilityGrid}>
            {capabilities.map((item) => (
              <Link className={styles.capability} href={item.href} key={item.name}>
                <span className={styles.capabilityTop}>
                  <span>{item.number} / {item.note}</span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="authority-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Designed around financial truth</p>
            <h2 id="authority-title">Clarity is more than a balance on a screen.</h2>
            <p className={styles.lead}>
              Financial confidence depends on understanding where information came from, who
              authorized an action and what the available evidence actually establishes.
            </p>
            <p>
              Neptlium’s product language distinguishes intent from execution, provider
              observation from canonical records, and settlement from reconciliation.
            </p>
            <Link className={styles.textLink} href="/trust">
              How we think about trust <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <AuthorityStage />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="workflow-title">
        <div className={styles.shell}>
          <p className={styles.eyebrow}>A consistent operating principle</p>
          <h2 id="workflow-title">Every movement has authority. Every position has evidence.</h2>
          <ol className={styles.steps}>
            {[
              ['Understand', 'See the position, obligation or request in its financial context.'],
              ['Authorize', 'Apply policy, identity and the right level of approval before action.'],
              ['Evidence', 'Keep records of what was requested, observed and reconciled.'],
            ].map(([title, copy], index) => (
              <li key={title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="treasury-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>For organizations</p>
            <h2 id="treasury-title">Operate capital with control.</h2>
            <p className={styles.lead}>
              Treasury is designed around organizational liquidity, payment coordination,
              approvals, policy and operational oversight.
            </p>
            <p>
              Capabilities are presented according to their verified product state. A described
              workflow is not a claim that live execution or settlement is enabled.
            </p>
            <Link className={styles.textLink} href="/treasury">
              Explore Neptlium Treasury <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.editorialRows}>
            <article><h3>Liquidity context</h3><p>Bring sources, obligations and availability into a more coherent view.</p></article>
            <article><h3>Payment coordination</h3><p>Make intent, authorization and movement stages understandable.</p></article>
            <article><h3>Evidence and oversight</h3><p>Keep operational records and reconciliation distinct from provider observations.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capital-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>For individuals</p>
            <h2 id="capital-title">Your capital. A clearer view.</h2>
            <p className={styles.lead}>
              Understand your financial position through portfolio context, investment research,
              allocation and the activity behind each decision.
            </p>
            <Link className={styles.textLink} href="/capital">
              Explore Neptlium Capital <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.editorialRows}>
            <article><h3>Portfolio perspective</h3><p>Understand positions and how exposures relate to the whole.</p></article>
            <article><h3>Investment context</h3><p>Explore objectives, structures, risks and the details behind an idea.</p></article>
            <article><h3>Activity and records</h3><p>Keep decisions and supporting information connected.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="developers-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>For builders</p>
              <h2 id="developers-title">Infrastructure designed to be understood.</h2>
            </div>
            <Link className={styles.textLink} href="/infrastructure">
              Explore infrastructure <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.sectionLead}>
            Explore Neptlium’s developer direction, integration architecture and documentation.
            Technical surfaces describe supported interfaces and clearly identify capabilities
            that remain in development.
          </p>
          <div className={styles.audienceRows}>
            <Link href="/infrastructure"><div><h3>Neptlium Pay & infrastructure</h3><p>Understand the role of payment and platform infrastructure.</p></div><ArrowUpRight aria-hidden="true" /></Link>
            <Link href="https://docs.neptlium.com"><div><h3>Developer documentation</h3><p>Explore technical guidance and integration contracts.</p></div><ArrowUpRight aria-hidden="true" /></Link>
            <Link href="/company"><div><h3>Company & principles</h3><p>Learn about the purpose and principles behind Neptlium.</p></div><ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="research-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Research and perspective</p>
            <h2 id="research-title">Explore the ideas shaping capital.</h2>
            <p className={styles.lead}>
              Explore businesses, industries and themes through structured research. Collections
              are informational and are not investment products or recommendations.
            </p>
            <Link className={styles.textLink} href="/investments">
              Explore investment research <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <InvestCollections compact />
        </div>
      </section>

      <section className={`${styles.section} ${styles.tonal}`} aria-labelledby="questions-title">
        <div className={`${styles.shell} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Questions & next steps</p>
            <h2 id="questions-title">Start with a clearer perspective.</h2>
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
        <p>{DISCLOSURES.investment} {DISCLOSURES.general}</p>
      </div>
    </div>
  );
}
