import type { ReactNode } from 'react';
import { AssetIdentity } from '@neptlium/ui';

function ProductState({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' }) {
  return <span className={`product-state ${tone === 'blue' ? 'is-blue' : ''}`}>{children}</span>;
}

export function ProductFrame({
  title,
  state,
  children,
  className = '',
}: {
  title: string;
  state: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`product-frame ${className}`} aria-label={`${title}: ${state}`}>
      <header>
        <strong>{title}</strong>
        <ProductState tone="blue">{state}</ProductState>
      </header>
      <div className="product-plane">{children}</div>
    </section>
  );
}

const assets = [
  ['USDC', 'Base', 'Digital asset'],
  ['BTC', 'Bitcoin', 'Digital asset'],
  ['ETH', 'Base', 'Digital asset'],
] as const;

export function OperatingEnvironmentVisual() {
  const modules = ['Capital Account', 'Portfolio', 'Treasury', 'Allocation'] as const;
  return (
    <ProductFrame title="Capital position" state="Overview" className="operating-proof">
      <div className="operating-proof-grid">
        {modules.map((module) => (
          <div key={module}>
            <span>{module}</span>
            <strong>Unavailable</strong>
          </div>
        ))}
      </div>
      <div className="operating-proof-activity">
        <span>Capital activity</span>
        <strong>No capital activity yet</strong>
      </div>
    </ProductFrame>
  );
}

export function CapitalSystemVisual() {
  return (
    <div className="capital-system-visual" aria-label="Neptlium capital operating environment">
      {['Capital Account', 'Portfolio', 'Treasury', 'Allocation'].map((item, index) => (
        <article key={item}>
          <span>0{index + 1}</span>
          <strong>{item}</strong>
          <small>{index === 0 ? 'Capital state' : index === 1 ? 'Exposure' : index === 2 ? 'Liquidity' : 'Policy'}</small>
        </article>
      ))}
      <div className="capital-system-foundation">
        <span>Execution architecture</span>
        <i aria-hidden="true" />
        <span>Reconciliation</span>
      </div>
    </div>
  );
}

export function OperatingModelVisual() {
  const stages = [
    ['Observe', 'Understand capital state.'],
    ['Model', 'Evaluate a proposed state.'],
    ['Authorize', 'Govern a specific decision.'],
    ['Execute', 'Submit only through supported controls.'],
    ['Reconcile', 'Resolve canonical financial consequence.'],
  ] as const;
  return (
    <ol className="operating-model-visual" aria-label="Neptlium operating model">
      {stages.map(([stage, meaning], index) => (
        <li key={stage}>
          <span>0{index + 1}</span>
          <strong>{stage}</strong>
          <small>{meaning}</small>
        </li>
      ))}
    </ol>
  );
}

export function PlatformArchitectureVisual() {
  return (
    <div className="platform-architecture-visual" aria-label="Conceptual Neptlium platform architecture">
      <div><span>Customer environment</span><strong>Capital operations</strong></div>
      <i aria-hidden="true" />
      <div><span>Control plane</span><strong>Authorization · policy · reservations</strong></div>
      <i aria-hidden="true" />
      <div><span>Financial truth</span><strong>Ledger · reconciliation</strong></div>
      <i aria-hidden="true" />
      <div><span>External evidence</span><strong>Providers / networks</strong></div>
    </div>
  );
}

export function PortfolioVisual() {
  return (
    <ProductFrame title="Portfolio" state="Structural view">
      <div className="visual-heading">
        <div><span>Portfolio position</span><strong>Unavailable</strong></div>
        <ProductState>Observed</ProductState>
      </div>
      <div className="asset-structure">
        {assets.map(([asset, network, role]) => (
          <div key={asset}>
            <AssetIdentity asset={asset} network={network} size="md" detailed />
            <span>{role}</span>
            <span>Unavailable</span>
          </div>
        ))}
      </div>
      <div className="future-market-row"><span>Listed markets</span><strong>Future capital-universe direction</strong></div>
    </ProductFrame>
  );
}

export function CapitalAccountVisual() {
  return (
    <ProductFrame title="Capital Account" state="Governed view">
      <dl className="capital-state-grid">
        <div><dt>Available</dt><dd>Unavailable</dd></div>
        <div><dt>Reserved</dt><dd>Unavailable</dd></div>
        <div><dt>Pending</dt><dd>Unavailable</dd></div>
      </dl>
      <div className="operating-proof-activity"><span>Recent activity</span><strong>No capital activity yet</strong></div>
      <p className="visual-disclosure">Provider-observed state does not become canonical balance by display convention.</p>
    </ProductFrame>
  );
}

export function TreasuryVisual() {
  return (
    <ProductFrame title="Treasury" state="Operational structure">
      <div className="treasury-operating-grid">
        <div><span>Liquidity</span><strong>Unavailable</strong></div>
        <div><span>Funding</span><strong>Architecture</strong></div>
        <div><span>Transfers</span><strong>Governed workflow</strong></div>
      </div>
      <div className="treasury-policy-line"><span>Capital movement</span><strong>Governed by account state and policy</strong></div>
    </ProductFrame>
  );
}

export function TransferVisual() {
  return (
    <ProductFrame title="Transfer" state="Authorization required">
      <dl className="transfer-structure">
        <div><dt>Source</dt><dd>Capital Account</dd></div>
        <div><dt>Destination</dt><dd>Verified destination</dd></div>
        <div><dt>Amount</dt><dd>Unavailable</dd></div>
        <div><dt>State</dt><dd>Authorization required</dd></div>
      </dl>
      <Lifecycle states={['Authorize', 'Reserve', 'Submit', 'Settle', 'Reconcile']} />
    </ProductFrame>
  );
}

const allocationRoles = ['Reserve', 'Core', 'Growth', 'Opportunity', 'Restricted'] as const;

export function AllocationVisual() {
  return (
    <ProductFrame title="Allocation" state="Governed lifecycle">
      <Lifecycle states={['Observed', 'Modeled', 'Authorized', 'Executed', 'Reconciled']} />
      <ul className="allocation-role-list">
        {allocationRoles.map((role) => <li key={role}>{role}</li>)}
      </ul>
      <p className="modeling-rule">Modeling does not move capital.</p>
    </ProductFrame>
  );
}

export function CapitalUniverseVisual() {
  return (
    <ProductFrame title="Capital Universe" state="Current + future direction">
      <div className="capital-universe-grid">
        <section><span>Digital assets</span><strong>USDC · BTC · ETH</strong><small>Availability depends on supported provider and network capability.</small></section>
        <section><span>Listed markets</span><strong>Equities · Funds</strong><small>Future architecture. No brokerage or listed-security execution is currently represented.</small></section>
      </div>
    </ProductFrame>
  );
}

function Lifecycle({ states }: { states: readonly string[] }) {
  return (
    <ol className="execution-lifecycle">
      {states.map((state, index) => (
        <li key={state}><span>{String(index + 1).padStart(2, '0')}</span><strong>{state}</strong></li>
      ))}
    </ol>
  );
}

export function ExecutionLifecycleVisual() {
  return (
    <ProductFrame title="Execution architecture" state="Explicit lifecycle">
      <Lifecycle states={['Intent', 'Authorization', 'Reservation', 'Submission', 'Settlement', 'Reconciliation']} />
      <p className="visual-disclosure">Submission is not settlement. Provider completion is not reconciliation.</p>
    </ProductFrame>
  );
}

export function SecurityFlowVisual() {
  const boundaries = ['Identity', 'Authorization', 'Ownership', 'Policy', 'Auditability', 'Reconciliation'] as const;
  return (
    <ol className="security-flow" aria-label="Neptlium governance architecture">
      {boundaries.map((item, index) => (
        <li key={item}><span>0{index + 1}</span><strong>{item}</strong>{index < boundaries.length - 1 && <i aria-hidden="true" />}</li>
      ))}
    </ol>
  );
}
