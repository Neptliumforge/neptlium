import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  AllocationVisual,
  CapitalAccountVisual,
  CapitalSystemVisual,
  CapitalUniverseVisual,
  ExecutionLifecycleVisual,
  OperatingEnvironmentVisual,
  PortfolioVisual,
  SecurityFlowVisual,
  TransferVisual,
  TreasuryVisual,
} from '@/components/product-visuals';
import { Reveal } from '@/components/reveal';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Capital, operated as one system.',
  description: SITE.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="production-home">
      <section className="production-hero" aria-labelledby="home-hero-title">
        <div className="production-shell production-hero-grid">
          <div className="production-hero-copy">
            <h1 id="home-hero-title">Capital, operated as one system.</h1>
            <p>
              Neptlium brings accounts, portfolios, treasury, transfers and allocation into one
              governed environment for understanding and directing modern capital.
            </p>
            <div className="production-hero-actions">
              <a className="button production-primary" href={SITE.accessUrl}>
                Access Neptlium <ArrowRight aria-hidden="true" />
              </a>
              <Link className="production-secondary" href="/platform">
                Explore the platform
              </Link>
            </div>
          </div>
          <Reveal className="production-hero-proof">
            <OperatingEnvironmentVisual />
          </Reveal>
        </div>
      </section>

      <section className="production-section operating-environment" aria-labelledby="environment-title">
        <div className="production-shell split-heading">
          <Reveal><h2 id="environment-title">One environment for capital operations.</h2></Reveal>
          <Reveal><p>Understand capital, govern liquidity, direct transfers and manage allocation without fragmenting the operating model across disconnected systems.</p></Reveal>
        </div>
        <Reveal className="production-shell"><CapitalSystemVisual /></Reveal>
      </section>

      <section className="production-section product-story" aria-labelledby="capital-account-title">
        <div className="production-shell product-story-grid">
          <Reveal className="product-story-copy">
            <span>Capital Account</span>
            <h2 id="capital-account-title">A governed account for modern capital.</h2>
            <p>Capital Account brings balances, availability, reservations and capital activity into a controlled operating view.</p>
            <Link href="/capital-account">Explore Capital Account <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
          <Reveal className="product-story-plane"><CapitalAccountVisual /></Reveal>
        </div>
      </section>

      <section className="production-section product-story soft" aria-labelledby="portfolio-title">
        <div className="production-shell product-story-grid reversed">
          <Reveal className="product-story-copy">
            <span>Portfolio</span>
            <h2 id="portfolio-title">Your capital, understood as a whole.</h2>
            <p>Portfolio brings positions and capital exposure into one coherent view across the assets and accounts Neptlium can truthfully recognize.</p>
            <Link href="/portfolio-intelligence">Explore Portfolio <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
          <Reveal className="product-story-plane"><PortfolioVisual /></Reveal>
        </div>
      </section>

      <section className="production-section treasury-story" aria-labelledby="treasury-title">
        <div className="production-shell split-heading">
          <Reveal><span>Treasury + Transfers</span><h2 id="treasury-title">Liquidity, governed.</h2></Reveal>
          <Reveal><p>Treasury organizes funding, reserves and capital movement around explicit controls. Transfers are designed around authorization, capital availability, execution state and reconciliation.</p></Reveal>
        </div>
        <div className="production-shell dual-plane">
          <Reveal><TreasuryVisual /></Reveal>
          <Reveal><TransferVisual /></Reveal>
        </div>
      </section>

      <section className="production-section product-story soft" aria-labelledby="allocation-title">
        <div className="production-shell product-story-grid">
          <Reveal className="product-story-copy">
            <span>Allocation</span>
            <h2 id="allocation-title">Allocation with policy behind it.</h2>
            <p>Model how capital should be distributed, compare it with current exposure and move toward execution through governed decisions.</p>
            <Link href="/allocation">Explore Allocation <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
          <Reveal className="product-story-plane"><AllocationVisual /></Reveal>
        </div>
      </section>

      <section className="production-section universe-story" aria-labelledby="universe-title">
        <div className="production-shell product-story-grid reversed">
          <Reveal className="product-story-copy">
            <span>Capital Universe</span>
            <h2 id="universe-title">A broader view of capital.</h2>
            <p>Neptlium is designed to bring supported digital assets and future listed-market exposure into a unified capital model without representing future brokerage capability as current.</p>
            <Link href="/capital-universe">Explore Capital Universe <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
          <Reveal className="product-story-plane"><CapitalUniverseVisual /></Reveal>
        </div>
      </section>

      <section className="production-section execution-story" aria-labelledby="execution-title">
        <div className="production-shell split-heading">
          <Reveal><span>Execution + reconciliation</span><h2 id="execution-title">Execution is a process, not a status.</h2></Reveal>
          <Reveal><p>Neptlium separates intent, authorization, submission, settlement and reconciliation so capital state remains explicit throughout its lifecycle.</p></Reveal>
        </div>
        <Reveal className="production-shell"><ExecutionLifecycleVisual /></Reveal>
      </section>

      <section className="production-section governance-story soft" aria-labelledby="governance-title">
        <div className="production-shell product-story-grid">
          <Reveal className="product-story-copy">
            <span>Security + governance</span>
            <h2 id="governance-title">Control is part of the architecture.</h2>
            <p>Identity, authorization, ownership, policy, auditability and reconciliation belong inside the capital operating model—not around it.</p>
            <Link href="/security">Explore security <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
          <Reveal className="product-story-plane"><SecurityFlowVisual /></Reveal>
        </div>
      </section>

      <section className="production-resolution" aria-labelledby="resolution-title">
        <div className="production-shell">
          <Reveal>
            <h2 id="resolution-title">Capital operations, made explicit.</h2>
            <p>One governed environment for understanding capital state and directing what comes next.</p>
            <a className="button production-primary" href={SITE.accessUrl}>Access Neptlium <ArrowRight aria-hidden="true" /></a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
