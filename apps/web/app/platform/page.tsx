import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  CapitalAccountVisual,
  OperatingEnvironmentVisual,
  OperatingModelVisual,
  PortfolioVisual,
} from '@/components/product-visuals';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';
import styles from '../marketing-platform.module.css';

export const metadata = createPageMetadata({
  title: 'Platform',
  description: 'Explore the Neptlium capital platform for portfolio visibility, capital management, funding, reporting and governed financial activity.',
  path: '/platform',
});

const capabilities = [
  ['Portfolio visibility', 'Understand positions, ownership context and portfolio structure without presenting unknown state as fact.'],
  ['Capital management', 'Keep available, reserved, pending and other capital states distinct where authoritative evidence supports them.'],
  ['Funding', 'Create governed funding instructions only through supported account and infrastructure capabilities.'],
  ['Transactions', 'Preserve initiation, processing, settlement and reconciliation as distinct states.'],
  ['Documents & reporting', 'Keep records, statements, investment documentation and account activity close to the capital they describe.'],
  ['Account controls', 'Use authenticated identity, authorization and server-side control boundaries for consequential actions.'],
] as const;

export default function PlatformPage() {
  return <div className={`${styles.scope} mp-home`}>
    <section className="mp-hero">
      <div className="mp-shell mp-hero-grid">
        <div className="mp-hero-copy">
          <p className="mp-kicker">Platform</p>
          <h1>One environment for understanding and operating capital.</h1>
          <p className="mp-hero-lead">Neptlium connects portfolio visibility, capital state, funding workflows, allocation, reporting and governed financial activity without collapsing different meanings into one generic balance or status.</p>
          <div className="mp-actions">
            <Link className="mp-button mp-button-primary" href={SITE.signUpUrl}>Get Started <ArrowRight aria-hidden="true" /></Link>
            <Link className="mp-button mp-button-secondary" href="/investments">View Investment Solutions</Link>
          </div>
        </div>
        <div className="mp-hero-product"><OperatingEnvironmentVisual /></div>
      </div>
    </section>

    <section className="mp-section">
      <div className="mp-shell">
        <div className="mp-section-heading">
          <p className="mp-kicker">Connected platform</p>
          <h2>See the investor experience as one system.</h2>
          <p>The platform is organized around a simple principle: investors should be able to understand where capital stands, what information supports that view, what action is available, and what happens after an action is taken.</p>
        </div>
        <div className="mp-solution-lines">
          {capabilities.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </div>
    </section>

    <section className="mp-section mp-dark">
      <div className="mp-shell mp-split">
        <div className="mp-sticky-copy">
          <p className="mp-kicker">Operating model</p>
          <h2>Know. Understand. Decide. Authorize. Verify.</h2>
          <p>Neptlium keeps interpretation and consequence separated. A model is not an approval. An approval is not submission. Submission is not settlement. Settlement is not reconciliation.</p>
        </div>
        <div className="mp-visual-plane"><OperatingModelVisual /></div>
      </div>
    </section>

    <section className="mp-section mp-reporting">
      <div className="mp-shell mp-split reverse">
        <div className="mp-visual-plane"><PortfolioVisual /></div>
        <div className="mp-sticky-copy">
          <p className="mp-kicker">Portfolio & reporting</p>
          <h2>Make visibility useful without making it overconfident.</h2>
          <p>Portfolio information should reveal what is known, what is unavailable, and what requires additional evidence. The same discipline applies to account activity, investment reporting and transaction records.</p>
          <Link className="mp-text-link" href="/products/portfolio-intelligence">Explore Portfolio Intelligence <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>

    <section className="mp-section mp-funding">
      <div className="mp-shell mp-split">
        <div className="mp-sticky-copy">
          <p className="mp-kicker">Capital Account</p>
          <h2>Funding is a financial workflow, not a button.</h2>
          <p>Funding instructions, provider evidence, canonical posting and reconciliation remain separate responsibilities. The platform should always make that lifecycle easier to understand.</p>
          <Link className="mp-text-link" href="/products/capital-account">Explore Capital Account <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="mp-visual-plane"><CapitalAccountVisual /></div>
      </div>
    </section>
  </div>;
}
