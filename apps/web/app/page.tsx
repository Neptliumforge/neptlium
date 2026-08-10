import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Eye,
  Fingerprint,
  KeyRound,
  Landmark,
  Layers3,
  LockKeyhole,
  Network,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { PlatformWindow } from '@/components/platform-window';
import { ProductStage } from '@/components/product-stage';
import {
  AllocationVisual,
  CapitalSystemVisual,
  OperatingModelVisual,
  PortfolioVisual,
  TreasuryVisual,
} from '@/components/product-visuals';
import { Reveal } from '@/components/reveal';
import { SITE } from '@/lib/content/site';
import { AssetIdentity } from '@neptlium/ui';

export const metadata: Metadata = {
  title: 'Own across markets. Operate as one portfolio.',
  description: SITE.description,
  alternates: { canonical: '/' },
};

const platform = [
  ['Portfolio Intelligence', 'See capital as a portfolio, not a collection of accounts.', ScanSearch],
  ['Capital Account', 'A governed account layer for digital capital.', KeyRound],
  ['Treasury', 'Know what is available, reserved and exposed.', Landmark],
  ['Allocation', 'Model positioning before making consequential decisions.', SlidersHorizontal],
] as const;
const controls = [
  ['Authentication', Fingerprint],
  ['Authorization', ShieldCheck],
  ['Isolation', Network],
  ['Auditability', Eye],
  ['Idempotency', LockKeyhole],
] as const;
const audiences = [
  ['Individual capital', 'A coherent operating view for personally controlled digital capital.'],
  ['Family capital', 'Structure ownership, reserves and long-term allocation more deliberately.'],
  ['Treasury teams', 'Bring digital capital into a more disciplined treasury operating model.'],
  ['Investment organizations', 'Separate portfolio structure, allocation intent and operating control.'],
] as const;

export default function HomePage() {
  return (
    <>
      <div className="capital-account-signal">
        <div className="capital-account-signal-inner">
          <span className="capital-account-signal-label">Capital Account</span>
          <p>One governed account infrastructure for modern digital capital.</p>
          <Link href="/capital-account">
            Explore <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="neptlium-hero">
        <div className="neptlium-hero-inner">
          <div className="neptlium-hero-copy">
            <p className="eyebrow">Capital operating infrastructure</p>
            <h1>Own across markets. Operate as one portfolio.</h1>
            <p>
              Neptlium brings portfolio intelligence, capital accounts, treasury and allocation into
              one governed environment for digital capital.
            </p>
            <div className="neptlium-hero-actions">
              <a className="button" href={SITE.accessUrl}>
                Open Neptlium <ArrowRight aria-hidden="true" />
              </a>
              <Link className="text-link" href="/platform">
                Explore platform <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="neptlium-hero-proof" aria-label="Neptlium core platform systems">
              {platform.map(([name], index) => (
                <span key={name}>
                  <i>0{index + 1}</i>
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="neptlium-hero-visual">
            <PlatformWindow />
          </div>
        </div>
      </section>

      <section className="section visibility-section">
        <Reveal>
          <div className="visibility-layout">
            <div className="section-lead">
              <h2>Ownership has expanded. The operating model has not.</h2>
              <p>
                Digital capital can exist across assets, accounts, networks and providers while the
                decisions around it remain fragmented. Neptlium is being built to bring those
                positions into one coherent operating environment.
              </p>
            </div>
            <div
              className="capital-convergence"
              aria-label="Fragmented capital resolving into one operating view"
            >
              <div>
                {['Assets', 'Accounts', 'Networks', 'Positions', 'Providers'].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <strong>NEPTLIUM</strong>
              <p>One capital operating view</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section operating-section">
        <Reveal>
          <div className="section-lead">
            <h2>One operating environment for modern capital.</h2>
            <p>
              Understand what you own, how it is positioned and what changes before capital moves.
            </p>
          </div>
        </Reveal>
        <Reveal><CapitalSystemVisual /></Reveal>
      </section>

      <section className="section steps">
        <Reveal>
          <div className="section-lead">
            <h2>Capital decisions should not begin with execution.</h2>
            <p>Each stage has a distinct purpose. Modeling does not move capital.</p>
          </div>
        </Reveal>
        <Reveal><OperatingModelVisual /></Reveal>
      </section>

      <ProductStage />

      <section className="section visibility-section">
        <Reveal>
          <div className="visibility-layout">
            <div className="section-lead">
              <h2>Understand the whole position.</h2>
              <p>
                Capital becomes more useful when ownership, liquidity, concentration and allocation
                can be understood together.
              </p>
            </div>
            <PortfolioVisual />
          </div>
        </Reveal>
      </section>

      <section className="section universe">
        <Reveal>
          <div className="section-lead">
            <p className="eyebrow">Capital Account</p>
            <h2>Capital needs an operating layer.</h2>
            <p>
              The Neptlium Capital Account is the account infrastructure through which supported
              digital capital can be organized and operated within explicit controls.
            </p>
          </div>
        </Reveal>
        <div className="asset-row">
          {[
            ['USDC', 'Base'],
            ['ETH', 'Base'],
            ['BTC', 'Bitcoin'],
          ].map(([asset, network], i) => (
            <Reveal key={asset}>
              <article>
                <span>0{i + 1}</span>
                <AssetIdentity
                  asset={asset}
                  network={network}
                  size="xl"
                  detailed
                  className="asset-pair"
                />
              </article>
            </Reveal>
          ))}
        </div>
        <p className="qualifier">
          Asset and network availability depends on production integrations and account eligibility.
        </p>
      </section>

      <section className="section treasury-section">
        <Reveal>
          <div className="treasury-layout">
            <div className="section-lead">
              <h2>Liquidity is more than a balance.</h2>
              <p>
                Understand available capital, reserves and treasury position as part of the same
                environment used for portfolio and allocation decisions.
              </p>
            </div>
            <TreasuryVisual />
          </div>
        </Reveal>
      </section>

      <section className="section visibility-section">
        <Reveal>
          <div className="visibility-layout">
            <div className="section-lead">
              <h2>Capital structure before capital movement.</h2>
              <p>
                Neptlium separates understanding a portfolio from changing it. Model allocation
                scenarios, evaluate structure and preserve explicit authorization between intent and
                execution.
              </p>
            </div>
            <AllocationVisual />
          </div>
        </Reveal>
      </section>

      <section className="section security-block">
        <Reveal>
          <div className="section-lead">
            <h2>Control is part of the system.</h2>
            <p>
              Neptlium is designed so that access, modeling, authorization and execution remain
              distinct operating concerns.
            </p>
          </div>
        </Reveal>
        <div className="control-grid">
          {controls.map(([label, Icon]) => (
            <Reveal key={label}>
              <div>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="qualifier">
          Architecture principles only. No certification, regulatory approval or custody readiness
          is claimed.
        </p>
      </section>

      <section className="section research-section">
        <Reveal>
          <div className="research-layout">
            <div className="section-lead">
              <p className="eyebrow">Neptlium Research</p>
              <h2>Thinking for a changing capital system.</h2>
              <p>
                Research and perspective on allocation, ownership, treasury and digital-capital
                infrastructure.
              </p>
            </div>
            <div className="research-index">
              {[
                'Capital structure',
                'Allocation',
                'Ownership',
                'Treasury',
                'Infrastructure risk',
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
              <Link href="/research">
                Explore research <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section steps">
        <Reveal>
          <div className="section-lead">
            <h2>Built for capital that needs more than another account.</h2>
          </div>
        </Reveal>
        <div className="step-grid">
          {audiences.map(([title, body], i) => (
            <Reveal key={title}>
              <article>
                <span>0{i + 1}</span>
                <Layers3 aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <Reveal>
          <p className="eyebrow">Neptlium</p>
          <h2>The operating layer for digital capital.</h2>
          <p>
            Ownership is becoming more complex. Capital operations should become more coherent.
            Neptlium is building the environment for that transition.
          </p>
          <div className="final-actions">
            <a className="button" href={SITE.accessUrl}>
              Open Neptlium <ArrowRight aria-hidden="true" />
            </a>
            <Link className="text-link" href="/platform">
              Explore Neptlium <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
