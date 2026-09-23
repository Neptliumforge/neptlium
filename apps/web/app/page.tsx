import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CapitalRails as CapitalRailsVisual } from '@neptlium/ui';
import { DISCLOSURES, SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from './home-elite.module.css';

export const metadata = createPageMetadata({
  title: 'Capital, intelligently managed',
  description: 'Neptlium is a capital operating platform for individuals and institutions.',
  path: '/',
});

function SignatureHeroObject() {
  return (
    <div className={styles.heroStage} aria-label="Neptlium Capital Rails — authority and evidence">
      <div className={styles.stageGlow} aria-hidden="true" />
      <div className={styles.signatureRailField}>
        <CapitalRailsVisual
          variant="movement"
          nodes={[
            { label: 'Capital', state: 'neutral' },
            { label: 'Position', state: 'neutral' },
            { label: 'Authority', state: 'authorized' },
            { label: 'Evidence', state: 'evidence' },
            { label: 'Reconciliation', state: 'reconciling' },
          ]}
          label="Capital moves through authority, evidence and reconciliation"
        />
        <div className={styles.railObjectCopy}>
          <span>Capital rails</span>
          <strong>Movement remains distinct from authority.</strong>
          <small>Illustrative system language — no customer data or execution state.</small>
        </div>
      </div>
    </div>
  );
}

function WorldStage() {
  return (
    <div
      className={styles.worldStage}
      aria-label="Illustrative view of financial contexts resolving into Neptlium"
    >
      <div className={styles.worldAxis} aria-hidden="true" />
      <div className={styles.worldCore}>Neptlium</div>
      <div className={`${styles.worldNode} ${styles.nodeAccounts}`}>Accounts</div>
      <div className={`${styles.worldNode} ${styles.nodeActivity}`}>Activity</div>
      <div className={`${styles.worldNode} ${styles.nodeContext}`}>Market context</div>
      <div className={`${styles.worldNode} ${styles.nodeRecords}`}>Records</div>
    </div>
  );
}

function ProductStage() {
  return (
    <div className={styles.productStage} aria-label="Illustrative Neptlium product composition">
      <div className={styles.productFrame}>
        <aside className={styles.productRail} aria-label="Illustrative product navigation">
          <strong>Neptlium</strong>
          <div className={styles.productNav}>
            <span>Overview</span>
            <span>Activity</span>
            <span>Portfolio</span>
            <span>Context</span>
            <span>Documents</span>
          </div>
        </aside>
        <div className={styles.productCanvas}>
          <div className={styles.productBar}>
            <span>Financial overview</span>
            <span>Illustrative interface</span>
          </div>
          <div className={styles.productContent}>
            <section className={styles.productPanel}>
              <small>Capital picture</small>
              <h3>See the shape, not just the total.</h3>
              <div className={styles.productBars} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </section>
            <div className={styles.productSide}>
              <article>
                <small>Activity</small>
                <strong>Movement stays connected to context.</strong>
              </article>
              <article>
                <small>Portfolio</small>
                <strong>Exposure becomes easier to understand.</strong>
              </article>
              <article>
                <small>Records</small>
                <strong>Important decisions keep their history.</strong>
              </article>
            </div>
          </div>
          <p className={styles.productNote}>
            Illustrative interface only. No customer balances, returns or performance data are
            shown.
          </p>
        </div>
      </div>
    </div>
  );
}

function SystemMap() {
  return (
    <div className={styles.systemMap} aria-label="Illustrative Neptlium connected financial system">
      <div className={styles.systemRing} aria-hidden="true" />
      <div className={styles.systemCenter}>Neptlium</div>
      <div className={`${styles.systemNode} ${styles.systemPerson}`}>Person or organization</div>
      <div className={`${styles.systemNode} ${styles.systemCapital}`}>Capital</div>
      <div className={`${styles.systemNode} ${styles.systemDecision}`}>Decisions + movement</div>
      <div className={`${styles.systemNode} ${styles.systemRecord}`}>Context + record</div>
    </div>
  );
}

const families = [
  {
    label: 'Capital',
    title: 'Personal wealth in context.',
    copy: 'Understand portfolio, investments, allocation and activity as one personal financial picture.',
    href: '/capital',
    tone: 'personal',
  },
  {
    label: 'Treasury',
    title: 'Operating money, coordinated.',
    copy: 'Manage organizational liquidity, payments, stablecoins, approvals and financial controls.',
    href: '/treasury',
    tone: 'business',
  },
  {
    label: 'Institutional',
    title: 'Systems for complex capital.',
    copy: 'A developing environment for funds, family offices and asset managers with deeper mandates and reporting.',
    href: '/institutional',
    tone: 'personal',
  },
  {
    label: 'Infrastructure',
    title: 'Build on Neptlium.',
    copy: 'Pay, API and developer systems designed around explicit financial authority boundaries.',
    href: '/infrastructure',
    tone: 'business',
  },
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} data-npt-surface="carbon" aria-labelledby="home-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <h1 id="home-title" data-npt-nts="hero">
              Capital, intelligently managed.
            </h1>
            <p className={styles.lead} data-npt-nts="lead">
              Invest, manage and move capital through one financial platform built for individuals
              and institutions.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href={SITE.personalSignUpUrl}>
                Get started <ArrowRight aria-hidden="true" />
              </a>
              <Link className={styles.secondary} href="/institutional">
                For institutions <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <SignatureHeroObject />
        </div>
      </section>

      <section
        id="financial-world"
        className={`${styles.section} ${styles.cloud}`}
        data-npt-surface="cloud"
        aria-labelledby="world-title"
      >
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <h2 id="world-title" className={styles.sectionTitle} data-npt-nts="h2">
              Know where your capital stands.
            </h2>
            <p>
              Bring positions, available capital, activity and records into one clear view without
              erasing the evidence or authority behind them.
            </p>
          </div>
          <WorldStage />
        </div>
      </section>

      <section
        className={`${styles.crossroads} ${styles.light}`}
        data-npt-surface="white"
        aria-labelledby="crossroads-title"
      >
        <div className={`${styles.shell} ${styles.crossroadsIntro}`}>
          <h2 id="crossroads-title" className={styles.sectionTitle} data-npt-nts="h2">
            Put capital to work.
          </h2>
        </div>
        <div className={styles.paths}>
          {families.map((family) => (
            <Link
              className={`${styles.path} ${family.tone === 'personal' ? styles.pathPersonal : styles.pathBusiness}`}
              href={family.href}
              key={family.label}
            >
              <div className={styles.pathVisual} aria-hidden="true" />
              <span className={styles.pathLabel}>{family.label}</span>
              <div>
                <h3 className={styles.pathTitle} data-npt-nts="h3">
                  {family.title}
                </h3>
                <p className={styles.pathCopy}>{family.copy}</p>
              </div>
              <div className={styles.pathFooter}>
                <span>Explore {family.label}</span>
                <ArrowRight aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.mineral}`}
        data-npt-surface="mineral"
        aria-labelledby="movement-title"
      >
        <div className={styles.shell}>
          <div className={styles.movementIntro}>
            <h2 id="movement-title" className={styles.movementTitle} data-npt-nts="h2">
              Every movement has authority.
            </h2>
            <p>
              Intent, approval, movement and record remain distinct so capital operations stay
              understandable from decision through reconciliation.
            </p>
          </div>
          <div className={styles.flow} aria-label="Illustrative capital-in-motion sequence">
            <div className={styles.flowLine} aria-hidden="true" />
            <div className={styles.flowItem}>
              <span>Intent</span>
              <strong>Define the movement.</strong>
            </div>
            <div className={styles.flowItem}>
              <span>Authority</span>
              <strong>Establish who can act.</strong>
            </div>
            <div className={styles.flowItem}>
              <span>Settlement</span>
              <strong>Keep execution explicit.</strong>
            </div>
            <div className={styles.flowItem}>
              <span>Evidence</span>
              <strong>Reconcile the record.</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.cloud}`}
        data-npt-surface="cloud"
        aria-labelledby="product-title"
      >
        <div className={styles.shell}>
          <div className={styles.productIntro}>
            <h2 id="product-title" className={styles.productTitle} data-npt-nts="h2">
              Everything you’ve invested in. One portfolio.
            </h2>
            <p>
              Portfolio brings ownership, allocation, performance context, activity and documents
              together while showing only information supported by authoritative account data.
            </p>
          </div>
          <ProductStage />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.carbon}`}
        data-npt-surface="carbon"
        aria-labelledby="system-title"
      >
        <div className={styles.shell}>
          <div className={styles.systemIntro}>
            <h2 id="system-title" className={styles.systemTitle} data-npt-nts="h2">
              Operate capital with control.
            </h2>
            <p>
              For organizations, Neptlium connects treasury, allocations, operations, authority and
              records without treating external rails as the source of financial truth.
            </p>
          </div>
          <SystemMap />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.ivory}`}
        data-npt-surface="ivory"
        aria-labelledby="intelligence-title"
      >
        <div className={styles.shell}>
          <div className={styles.intelligenceIntro}>
            <h2 id="intelligence-title" className={styles.intelligenceTitle} data-npt-nts="h2">
              Intelligence for every capital decision.
            </h2>
            <p>
              Understand what changed, what it relates to and which evidence deserves attention
              before you act.
            </p>
          </div>
          <div className={styles.intelligenceGrid}>
            <div>
              <p className={styles.intelligenceLead}>
                Intelligence should strengthen judgment. It never creates authority or moves capital
                on its own.
              </p>
              <Link className={`${styles.textLink} ${styles.intelligenceAction}`} href="/insights">
                Explore Intelligence <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.intelligencePoints}>
              <div>
                <strong>Companies and markets</strong>
                <p>Bring relevant external context closer to the capital it may affect.</p>
              </div>
              <div>
                <strong>Portfolio context</strong>
                <p>See concentration, exposure and activity as parts of one picture.</p>
              </div>
              <div>
                <strong>Capital activity</strong>
                <p>Keep movement understandable without presenting commentary as certainty.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={styles.disclosure}
        data-npt-surface="ivory"
        aria-label="General disclosure"
      >
        <div className={styles.shell}>
          <p>{DISCLOSURES.general}</p>
        </div>
      </section>
    </div>
  );
}
