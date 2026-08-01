import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/section';

export const metadata: Metadata = {
  title: 'Company',
  description: 'Capital, organized for the long term.',
  alternates: { canonical: '/company' },
};
const principles = [
  [
    'Long-term thinking',
    'We organize capital around durable objectives rather than short-term reaction.',
  ],
  ['Truthful presentation', 'Capabilities, risks and availability must be communicated clearly.'],
  [
    'Explicit control',
    'Consequential decisions remain understandable, attributable and intentional.',
  ],
  [
    'Portfolio purpose',
    'Every allocation should have a defined role inside the wider capital mandate.',
  ],
  ['Liquidity discipline', 'Capital readiness is part of portfolio strategy.'],
  ['Security by design', 'Identity, authorization and operational boundaries are foundational.'],
  [
    'Institutional quality',
    'Every surface, process and decision pathway should earn confidence through clarity.',
  ],
  [
    'Responsible innovation',
    'New forms of ownership require proportionate controls and disciplined introduction.',
  ],
] as const;
export default function CompanyPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Company</p>
          <h1>Capital, organized for the long term.</h1>
          <p className="hero-copy">
            Neptlium is an institutional capital-allocation platform built to help individuals and
            institutions understand ownership, organize portfolios, evaluate decisions and operate
            capital through one governed environment.
          </p>
          <p className="hero-copy">
            Portfolio intelligence, Capital Account, allocation modeling, treasury visibility,
            performance analysis and research work together as one coherent capital system.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/platform">
              Explore the Platform
            </Link>
            <Link className="button secondary" href="/contact">
              Contact Neptlium
            </Link>
          </div>
        </div>
      </section>
      <Section>
        <div id="purpose" className="company-editorial">
          <p className="eyebrow">Our purpose</p>
          <h2>Bring structure to modern ownership.</h2>
          <p>
            Ownership now spans digital assets, public markets, reserve capital and evolving
            tokenized opportunities.
          </p>
          <p>
            Neptlium organizes those environments around one portfolio mandate so investors can
            understand what they own, why they own it, where risk is accumulating and how capital
            should be positioned.
          </p>
        </div>
      </Section>
      <Section tone="surface">
        <div id="mission" className="company-editorial">
          <p className="eyebrow">Our mission</p>
          <h2>Make capital more understandable, deliberate and governed.</h2>
          <p>
            Neptlium exists to give modern investors a clearer operating environment for portfolio
            intelligence, allocation decisions, capital movement, treasury readiness and long-term
            ownership.
          </p>
        </div>
      </Section>
      <Section>
        <div id="vision" className="company-editorial">
          <p className="eyebrow">Our vision</p>
          <h2>One portfolio view across the evolving world of capital.</h2>
          <p>
            As ownership expands across markets and asset structures, investors should not have to
            operate through disconnected balances, fragmented information and isolated decisions.
          </p>
          <p>
            Neptlium provides one environment through which capital can be understood and organized
            as a coherent system.
          </p>
        </div>
      </Section>
      <Section tone="subtle">
        <div id="principles" className="principles-editorial">
          <p className="eyebrow">Our principles</p>
          <h2>Built around enduring disciplines.</h2>
          <div>
            {principles.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div id="leadership" className="company-editorial">
          <p className="eyebrow">Leadership</p>
          <h2>Stewardship before visibility.</h2>
          <p>
            Neptlium is governed around long-term ownership, institutional discipline and explicit
            responsibility for capital operations.
          </p>
          <p>Leadership information is communicated through verified company channels.</p>
        </div>
      </Section>
      <Section tone="surface">
        <div id="careers" className="company-editorial">
          <p className="eyebrow">Careers</p>
          <h2>Build systems that help capital endure.</h2>
          <p>
            Neptlium brings together people who care deeply about capital markets, product quality,
            investor understanding, security and operational excellence.
          </p>
          <p>
            Product and Portfolio Systems · Software Engineering · Security · Product Design ·
            Capital Research · Investment Operations · Risk and Controls · Client Experience
          </p>
          <h3>Current opportunities</h3>
          <p>
            No public positions are listed at this time. General expressions of interest may be
            directed through the official contact channel.
          </p>
        </div>
      </Section>
      <Section>
        <div className="company-editorial">
          <p className="eyebrow">Connect with Neptlium</p>
          <h2>Official company channels.</h2>
          <p>
            For general, investor support, institutional and media enquiries, contact{' '}
            <a href="mailto:support@neptlium.com">support@neptlium.com</a>.
          </p>
          <Link className="button" href="/contact">
            Contact Neptlium
          </Link>
        </div>
      </Section>
    </>
  );
}
