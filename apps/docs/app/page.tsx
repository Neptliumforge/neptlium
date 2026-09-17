const capabilityRows = [
  ['Company research', 'Available', 'Identified public-source context. Not advice or execution.'],
  ['Thesis evaluation', 'Beta', 'User-directed evaluation with inputs and outcomes kept distinct.'],
  ['Portfolio context', 'Beta', 'Shown only when authoritative portfolio data supports it.'],
  [
    'Organization authority',
    'Planned',
    'No public production approval contract is represented as active.',
  ],
  [
    'Agentic capital execution',
    'Unavailable',
    'AI cannot create authority or initiate unrestricted execution.',
  ],
  [
    'Canonical financial state',
    'Beta',
    'Neptlium ledger state remains separate from provider observations.',
  ],
  [
    'Provider evidence ingress',
    'Beta',
    'Signed, replay-safe evidence; never canonical truth by itself.',
  ],
  [
    'Reconciliation',
    'Beta',
    'Mismatch records support review; settled remains distinct from reconciled.',
  ],
] as const;

const authorityFlow = [
  'Mandate',
  'Authority check',
  'Denied / Approval required / Authorized',
  'Execution',
  'Reconciliation',
  'Record',
] as const;
const navigation = [
  ['Start', '#start'],
  ['Capabilities', '#capabilities'],
  ['Authority', '#authority'],
  ['Financial state', '#financial-state'],
  ['API safety', '#api-safety'],
] as const;

export default function DeveloperDocsHome() {
  return (
    <div className="docs-shell">
      <aside className="docs-nav" aria-label="Documentation navigation">
        <a className="docs-brand" href="#start" aria-label="Neptlium Developers home">
          NEPTLIUM<span>Developers</span>
        </a>
        <nav>
          {navigation.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="docs-links">
          <a href="https://api.neptlium.com/v1/platform/capabilities">Capability contract</a>
          <a href="https://status.neptlium.com">System status</a>
        </div>
      </aside>
      <main className="docs-main">
        <section className="docs-hero" id="start" aria-labelledby="docs-title">
          <p className="docs-eyebrow">Neptlium Infrastructure</p>
          <h1 className="docs-title" id="docs-title">
            Build against financial truth.
          </h1>
          <p className="docs-copy">
            Neptlium exposes governed product boundaries without turning provider configuration,
            interface state, or intelligence into financial authority.
          </p>
          <div className="docs-callout">
            <span>Governing principle</span>
            <strong>
              Every movement has authority.
              <br />
              Every position has evidence.
            </strong>
          </div>
        </section>
        <section className="docs-section" id="capabilities" aria-labelledby="capabilities-title">
          <div className="docs-section-heading">
            <div>
              <p className="docs-kicker">Capability contract</p>
              <h2 id="capabilities-title">What exists now</h2>
            </div>
            <p>
              Available means a production contract exists. Beta means the implemented boundary is
              limited. Planned and Unavailable never imply live capability.
            </p>
          </div>
          <div className="capability-table" role="table" aria-label="Platform capabilities">
            <div className="capability-header" role="row">
              <span role="columnheader">Capability</span>
              <span role="columnheader">State</span>
              <span role="columnheader">Boundary</span>
            </div>
            {capabilityRows.map(([name, state, detail]) => (
              <div className="capability-row" role="row" key={name}>
                <strong role="cell">{name}</strong>
                <span role="cell" className={`docs-status docs-status-${state.toLowerCase()}`}>
                  {state}
                </span>
                <p role="cell">{detail}</p>
              </div>
            ))}
          </div>
          <p className="docs-footnote">
            Machine-readable:{' '}
            <a href="https://api.neptlium.com/v1/platform/capabilities">
              <code>GET /v1/platform/capabilities</code>
            </a>
          </p>
        </section>
        <section className="docs-section" id="authority" aria-labelledby="authority-title">
          <div className="docs-section-heading">
            <div>
              <p className="docs-kicker">Authority</p>
              <h2 id="authority-title">Intelligence informs. Authority governs.</h2>
            </div>
            <p>
              Authentication proves identity. Intelligence provides context. Neither grants
              permission to move capital.
            </p>
          </div>
          <ol className="authority-flow">
            {authorityFlow.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <div className="docs-rule">
            <strong>AI does not create authority.</strong>
            <p>
              Any future agentic action must remain inside an independently established mandate,
              pass policy and approval checks, and produce execution, reconciliation, and record
              evidence.
            </p>
          </div>
        </section>
        <section className="docs-section" id="financial-state" aria-labelledby="state-title">
          <div className="docs-section-heading">
            <div>
              <p className="docs-kicker">Financial state</p>
              <h2 id="state-title">Preserve the distinctions</h2>
            </div>
            <p>
              Each transition carries different evidence. Applications must not collapse these
              states for convenience.
            </p>
          </div>
          <div className="state-grid">
            {[
              ['Unknown', 'is not', 'Zero'],
              ['Provider observation', 'is not', 'Canonical ledger'],
              ['Approved', 'is not', 'Submitted'],
              ['Submitted', 'is not', 'Settled'],
              ['Settled', 'is not', 'Reconciled'],
              ['Modeled', 'is not', 'Executed'],
            ].map(([left, relation, right]) => (
              <div key={left}>
                <strong>{left}</strong>
                <span>{relation}</span>
                <strong>{right}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="docs-section" id="api-safety" aria-labelledby="api-title">
          <div className="docs-section-heading">
            <div>
              <p className="docs-kicker">API safety</p>
              <h2 id="api-title">One privileged boundary</h2>
            </div>
            <p>
              <code>api.neptlium.com</code> owns domain truth. Public clients do not receive
              provider secrets, service credentials, or direct execution authority.
            </p>
          </div>
          <div className="docs-code-grid">
            <pre>{`# Public operational contracts\nGET /v1/health\nGET /v1/status\nGET /v1/version\nGET /v1/platform/capabilities`}</pre>
            <pre>{`# Governed command requirements\nAuthorization: Bearer …\nIdempotency-Key: …\nX-Request-Id: …\n\n# Sensitive responses\nCache-Control: no-store`}</pre>
          </div>
          <p className="docs-footnote">
            Funding, treasury, and account routes have narrower authentication, ownership, policy,
            durability, and capability requirements. Consult a reviewed contract before integrating
            a command.
          </p>
        </section>
      </main>
    </div>
  );
}
