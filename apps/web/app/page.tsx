import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroArchitecture } from '@/components/hero-architecture';
import { Reveal } from '@/components/reveal';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Neptlium — Capital Operating Infrastructure',
  description: SITE.description,
  alternates: { canonical: '/' },
};

const capitalEnvironments = [
  {
    number: '01',
    name: 'Digital assets',
    description:
      'Access established blockchain assets and digital infrastructure through a controlled allocation environment.',
    examples: ['Bitcoin', 'Ether', 'Solana', 'Chainlink', 'USDC'],
  },
  {
    number: '02',
    name: 'Public markets',
    description:
      'Organize exposure across companies and funds shaping artificial intelligence, technology, healthcare, industry and global commerce.',
    examples: [
      'Invesco QQQ',
      'NVIDIA',
      'Apple',
      'Microsoft',
      'Alphabet',
      'Amazon',
      'Tesla',
      'Berkshire Hathaway',
      'Eli Lilly',
      'Micron Technology',
      'SK Hynix',
    ],
  },
  {
    number: '03',
    name: 'Tokenized opportunities',
    description:
      'Evaluate approved blockchain-based exposure to eligible public-market, private-market and alternative assets.',
    disclosure:
      'Every instrument is assessed according to its legal structure, underlying exposure, issuer, custody model, liquidity and counterparty risk.',
  },
  {
    number: '04',
    name: 'Reserve assets',
    description:
      'Maintain capital designated for liquidity, obligations and future allocation through clearly classified reserve structures.',
    examples: ['Liquidity reserves', 'Stable-value instruments', 'Future allocation capacity'],
  },
] as const;

const productSystems = [
  {
    number: '01',
    layer: 'Executive layer',
    name: 'Overview',
    description:
      'See portfolio value, allocation performance, liquidity, exposure and recent activity in one executive view.',
  },
  {
    number: '02',
    layer: 'Intelligence',
    name: 'Portfolio',
    description:
      'Understand every holding, its purpose, its performance and its contribution to the wider portfolio.',
  },
  {
    number: '03',
    layer: 'Discovery',
    name: 'Capital Universe',
    description:
      'Discover digital assets, public-market securities, reserve assets and approved tokenized opportunities.',
  },
  {
    number: '04',
    layer: 'Decision layer',
    name: 'Allocation',
    description:
      'Observe the current structure, model possible changes and authorize the next capital decision.',
  },
  {
    number: '05',
    layer: 'Operating layer',
    name: 'Capital Account',
    description:
      'Fund, hold, transfer and deploy supported capital through one governed account infrastructure.',
  },
  {
    number: '06',
    layer: 'Operating layer',
    name: 'Treasury',
    description: 'Organize liquidity, reserves, obligations and capital readiness.',
  },
] as const;

const intelligenceLayers = [
  {
    name: 'Executive layer',
    dimensions: ['Total portfolio value', 'Net allocation return', 'Liquidity position'],
  },
  {
    name: 'Analysis layer',
    dimensions: [
      'Asset contribution',
      'Concentration',
      'Exposure',
      'Realized performance',
      'Unrealized performance',
    ],
  },
  {
    name: 'Operating layer',
    dimensions: ['Capital activity', 'Portfolio role'],
  },
] as const;

const portfolioInsights = [
  {
    name: 'Holdings',
    description:
      'Every position organized by asset, classification, purpose and portfolio contribution.',
  },
  {
    name: 'Liquidity',
    description: 'See what is available, reserved, committed or difficult to exit.',
  },
  {
    name: 'Concentration',
    description: 'Understand where ownership, network or counterparty exposure is accumulating.',
  },
  {
    name: 'Performance',
    description: 'Connect outcomes to the assets, allocations and decisions that produced them.',
  },
  {
    name: 'Activity',
    description: 'Review the capital events that changed the portfolio over time.',
  },
  {
    name: 'Risk',
    description: 'Identify where portfolio structure requires attention before action.',
  },
] as const;

const accountGroups = [
  {
    number: '01',
    name: 'Capital position',
    responsibilities: [
      'Maintain available balances',
      'Track pending capital',
      'Supported balances',
    ],
  },
  {
    number: '02',
    name: 'Capital movement',
    responsibilities: [
      'Deposit capital',
      'Transfer supported assets',
      'Receive distributions',
      'Withdraw available capital',
    ],
  },
  {
    number: '03',
    name: 'Capital control',
    responsibilities: [
      'Authorize allocations',
      'Allocation readiness',
      'Review complete account activity',
    ],
  },
] as const;

const accountSequence = [
  ['Fund', 'Bring supported capital into one governed account environment.'],
  ['Organize', 'Separate available, pending, reserved and allocated capital clearly.'],
  ['Authorize', 'Require explicit review before consequential capital movement.'],
  ['Deploy', 'Connect approved capital to supported portfolio decisions.'],
  ['Review', 'Maintain a complete record of account activity and operational status.'],
] as const;

const accountControls = [
  'Authenticated access',
  'Explicit authorization',
  'Supported network validation',
  'Activity records',
  'Controlled withdrawals',
  'Provider verification',
  'Account-level operational boundaries',
] as const;

const allocationStages = [
  {
    number: '01',
    name: 'Observe',
    headline: 'Understand the portfolio as it exists now.',
    description:
      'Review holdings, liquidity, concentration, performance and exposure through connected portfolio intelligence.',
    dimensions: [
      'Current structure',
      'Portfolio role',
      'Liquidity',
      'Concentration',
      'Exposure',
      'Observed drift',
    ],
  },
  {
    number: '02',
    name: 'Model',
    headline: 'Explore what could change.',
    description:
      'Compare possible allocations, projected portfolio structure, liquidity effects and concentration without moving capital.',
    dimensions: [
      'Scenario comparison',
      'Proposed classification changes',
      'Liquidity effects',
      'Exposure changes',
      'Concentration effects',
      'Portfolio structure',
    ],
  },
  {
    number: '03',
    name: 'Authorize',
    headline: 'Move only when the decision is understood.',
    description:
      'Review the proposed allocation and authorize execution through defined identity, security and approval controls.',
    dimensions: [
      'Review',
      'Policy validation',
      'Identity',
      'Approval',
      'Explicit authorization',
      'Execution boundary',
    ],
  },
] as const;

const authorizationControls = [
  'Identity verified',
  'Policy reviewed',
  'Liquidity considered',
  'Exposure reviewed',
  'Approval required',
  'Execution explicit',
] as const;

const capitalClassifications = [
  {
    number: '01',
    name: 'Reserve',
    description: 'Capital maintained for liquidity, obligations and future opportunities.',
  },
  {
    number: '02',
    name: 'Core',
    description: 'Long-term foundational exposure to established assets and durable ownership.',
  },
  {
    number: '03',
    name: 'Growth',
    description:
      'Capital positioned toward expanding industries, networks and economic infrastructure.',
  },
  {
    number: '04',
    name: 'Opportunity',
    description: 'Controlled exposure to higher-risk or time-sensitive opportunities.',
  },
  {
    number: '05',
    name: 'Restricted',
    description: 'Assets requiring additional eligibility, review or authorization.',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <aside className="capital-announcement" aria-label="Capital Account announcement">
        <div>
          <p>
            <span>Introducing Capital Account</span>
            <strong>One governed account infrastructure for modern capital.</strong>
          </p>
          <Link href="/platform">
            Explore Capital Account <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <section className="hero">
        <div className="hero-field" aria-hidden="true" />
        <div className="hero-layout">
          <div className="hero-inner">
            <p className="eyebrow">Capital operating infrastructure</p>
            <h1>
              Own across markets.
              <br />
              Operate as one portfolio.
            </h1>
            <p className="hero-copy">{SITE.description}</p>
            <div className="hero-actions">
              <a className="button" href={SITE.accessUrl}>
                Access Neptlium <ArrowRight aria-hidden="true" />
              </a>
              <Link className="text-link" href="/platform">
                Explore the platform <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <p className="hero-assurance">
              One Capital Account. <span>One portfolio view.</span> Explicit control.
            </p>
          </div>
          <HeroArchitecture />
        </div>
      </section>
      <div className="hero-transition" aria-hidden="true">
        <div>
          <span>Many ownership environments</span>
          <i />
          <b>One governed operating layer</b>
        </div>
      </div>

      <section className="modern-ownership" aria-labelledby="modern-ownership-heading">
        <div className="stage-two-shell">
          <Reveal>
            <header className="stage-two-lead">
              <p className="eyebrow">Modern ownership</p>
              <h2 id="modern-ownership-heading">
                From Bitcoin to the companies shaping the future.
              </h2>
              <p>
                Build a connected portfolio across established digital assets, public-market
                securities, reserve assets and approved tokenized opportunities—all organized
                according to one capital mandate.
              </p>
            </header>
          </Reveal>

          <Reveal className="ownership-system">
            <ol className="capital-bands">
              {capitalEnvironments.map((environment) => (
                <li key={environment.name}>
                  <article>
                    <div className="capital-band-heading">
                      <span>{environment.number}</span>
                      <h3>{environment.name}</h3>
                    </div>
                    <p>{environment.description}</p>
                    {'examples' in environment && (
                      <ul aria-label={`${environment.name} examples`}>
                        {environment.examples.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    )}
                    {'disclosure' in environment && (
                      <p className="instrument-disclosure">{environment.disclosure}</p>
                    )}
                  </article>
                </li>
              ))}
            </ol>
            <div className="mandate-convergence" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="capital-mandate">
              <span>One mandate.</span>
              <strong>Multiple capital environments.</strong>
              <span>One governed portfolio.</span>
            </div>
          </Reveal>
          <p className="availability-disclosure">
            Product availability varies by jurisdiction, investor eligibility, account type,
            supported asset, network and provider coverage.
          </p>
        </div>
      </section>

      <section className="product-environment" aria-labelledby="product-environment-heading">
        <div className="stage-two-shell">
          <Reveal>
            <header className="stage-two-lead product-lead">
              <p className="eyebrow">The Neptlium experience</p>
              <h2 id="product-environment-heading">
                One environment for the full life of capital.
              </h2>
              <p>
                Neptlium connects portfolio understanding, asset discovery, allocation decisions,
                capital operations, treasury readiness and reporting through one governed product
                architecture.
              </p>
            </header>
          </Reveal>

          <Reveal className="product-system-map">
            <div className="system-spine" aria-hidden="true" />
            <ol>
              {productSystems.map((product) => (
                <li className={`product-node product-node-${product.number}`} key={product.name}>
                  <Link href="/platform">
                    <span className="product-index">{product.number}</span>
                    <span className="product-layer">{product.layer}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="product-environment-action">
            <Link className="button" href="/platform">
              Explore the platform <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="stage-two-transition" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </section>

      <section className="portfolio-intelligence" aria-labelledby="portfolio-intelligence-heading">
        <div className="portfolio-entry" aria-hidden="true">
          <span />
        </div>
        <div className="stage-two-shell">
          <div className="portfolio-intelligence-layout">
            <Reveal className="portfolio-editorial">
              <p className="eyebrow">Portfolio Intelligence</p>
              <h2 id="portfolio-intelligence-heading">
                See capital as a system—not a collection of positions.
              </h2>
              <p className="portfolio-supporting-copy">
                Neptlium connects holdings, performance, liquidity, concentration, exposure and
                capital activity into one coherent operating view.
              </p>
              <p className="portfolio-secondary-copy">
                Understand what you own, why you own it, how it is performing and where risk is
                accumulating.
              </p>
              <Link className="button" href="/platform">
                Explore Portfolio Intelligence <ArrowRight aria-hidden="true" />
              </Link>
            </Reveal>

            <Reveal className="intelligence-command-surface">
              <div className="intelligence-surface-header">
                <span>Portfolio / Intelligence architecture</span>
                <b>Coherent operating view</b>
              </div>
              <div className="intelligence-system">
                <div className="intelligence-geometry" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="portfolio-system-core">
                  <span>Connected context</span>
                  <strong>One portfolio system</strong>
                  <small>Purpose · structure · outcomes</small>
                </div>
                <ol className="intelligence-layers">
                  {intelligenceLayers.map((layer, layerIndex) => (
                    <li className={`intelligence-layer layer-${layerIndex + 1}`} key={layer.name}>
                      <div>
                        <span>0{layerIndex + 1}</span>
                        <h3>{layer.name}</h3>
                      </div>
                      <ul>
                        {layer.dimensions.map((dimension) => (
                          <li key={dimension}>
                            <span aria-hidden="true" />
                            {dimension}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="intelligence-surface-footer">
                <span>Understand</span>
                <i aria-hidden="true" />
                <span>Review</span>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <ul className="portfolio-insight-fields" aria-label="Portfolio insight groups">
              {portfolioInsights.map((insight, index) => (
                <li key={insight.name}>
                  <span>0{index + 1}</span>
                  <h3>{insight.name}</h3>
                  <p>{insight.description}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="capital-account-section" aria-labelledby="capital-account-heading">
        <div className="stage-two-shell">
          <Reveal>
            <header className="capital-account-lead">
              <div>
                <p className="eyebrow">Capital Account</p>
                <h2 id="capital-account-heading">One account for the movement of capital.</h2>
              </div>
              <div className="capital-account-narrative">
                <p>
                  Capital Account provides the operational foundation through which eligible users
                  can fund, hold, transfer and deploy supported capital across the Neptlium
                  environment.
                </p>
                <p>
                  Capital Account connects capital availability with portfolio decisions—without
                  reducing ownership to a trading balance.
                </p>
                <Link className="button" href="/platform">
                  Explore Capital Account <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </header>
          </Reveal>

          <Reveal className="capital-account-surface">
            <div className="account-surface-heading">
              <span>Capital Account / Governed operating layer</span>
              <strong>Explicit control</strong>
            </div>
            <div className="account-architecture">
              <div className="account-paths" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="account-boundary">
                <div className="account-core">
                  <span>Governed account boundary</span>
                  <strong>Capital positioned for decisions</strong>
                  <ul aria-label="Capital states">
                    {['Available', 'Pending', 'Reserved', 'Authorized', 'In review', 'Settled'].map(
                      (state) => (
                        <li key={state}>{state}</li>
                      ),
                    )}
                  </ul>
                </div>
                <ol className="account-groups">
                  {accountGroups.map((group) => (
                    <li key={group.name}>
                      <header>
                        <span>{group.number}</span>
                        <h3>{group.name}</h3>
                      </header>
                      <ul>
                        {group.responsibilities.map((responsibility) => (
                          <li key={responsibility}>{responsibility}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="account-edge-label account-edge-fund" aria-hidden="true">
                Controlled funding
              </div>
              <div className="account-edge-label account-edge-portfolio" aria-hidden="true">
                Portfolio decisions
              </div>
              <div className="account-activity-rail">
                <span>Activity</span>
                <p>
                  Complete account activity and operational status remain connected to the core.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <ol className="account-sequence" aria-label="Capital Account operating model">
              {accountSequence.map(([name, description], index) => (
                <li key={name}>
                  <span>0{index + 1}</span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="account-control-layer">
            <div>
              <p className="eyebrow">Security and control</p>
              <h3>Every movement stays inside explicit operating boundaries.</h3>
            </div>
            <ul>
              {accountControls.map((control) => (
                <li key={control}>
                  <span aria-hidden="true" />
                  {control}
                </li>
              ))}
            </ul>
          </Reveal>

          <p className="account-availability">
            Supported assets, networks and account capabilities may vary by jurisdiction,
            eligibility, provider coverage and account type.
          </p>
        </div>
      </section>

      <section className="allocation-section" aria-labelledby="allocation-heading">
        <div className="stage-two-shell">
          <Reveal>
            <header className="allocation-lead">
              <div>
                <p className="eyebrow">Allocation</p>
                <h2 id="allocation-heading">Model the decision before you move the capital.</h2>
              </div>
              <div>
                <p>
                  Build and compare allocation scenarios across assets, classifications and
                  strategies before authorizing execution.
                </p>
                <p className="allocation-boundary-statement">
                  Modeling does not move capital. Execution requires explicit authorization.
                </p>
                <Link className="button" href="/platform">
                  Explore Allocation <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </header>
          </Reveal>

          <Reveal className="allocation-environment">
            <div className="allocation-environment-header">
              <span>Allocation / Governed decision layer</span>
              <strong>Capital Account after authorization</strong>
            </div>
            <ol className="allocation-stages">
              {allocationStages.map((stage) => (
                <li key={stage.name}>
                  <article>
                    <header>
                      <span>{stage.number}</span>
                      <b>{stage.name}</b>
                    </header>
                    <div className="allocation-stage-field" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <h3>{stage.headline}</h3>
                    <p>{stage.description}</p>
                    <ul>
                      {stage.dimensions.map((dimension) => (
                        <li key={dimension}>{dimension}</li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
            <div className="allocation-execution-boundary">
              <div>
                <span>Decision boundary</span>
                <strong>Authorization precedes execution.</strong>
              </div>
              <span aria-hidden="true" />
              <b>Capital Account</b>
            </div>
          </Reveal>

          <Reveal className="authorization-layer">
            <div>
              <p className="eyebrow">Authorization boundary</p>
              <h3>Defined controls stand between a scenario and capital movement.</h3>
            </div>
            <ul>
              {authorizationControls.map((control) => (
                <li key={control}>
                  <span aria-hidden="true" />
                  {control}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="classifications-section" aria-labelledby="classifications-heading">
        <div className="stage-two-shell">
          <Reveal>
            <header className="classifications-lead">
              <p className="eyebrow">Capital classifications</p>
              <h2 id="classifications-heading">Give every allocation a purpose.</h2>
              <p>Neptlium organizes capital according to its role inside the wider portfolio.</p>
            </header>
          </Reveal>

          <Reveal className="classification-mandate">
            <div className="classification-axis" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
            <div className="classification-core">
              <span>One capital mandate</span>
              <strong>Role defines allocation context.</strong>
            </div>
            <ol className="classification-bands">
              {capitalClassifications.map((classification) => (
                <li key={classification.name}>
                  <span>{classification.number}</span>
                  <h3>{classification.name}</h3>
                  <p>{classification.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="classification-action">
            <Link className="button" href="/platform">
              Build your allocation framework <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="treasury-transition" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </section>
    </>
  );
}
