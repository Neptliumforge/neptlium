import type { ReactNode } from 'react';
import { AssetIdentity } from '@neptlium/ui';

function ProductState({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' }) {
  return <span className={`product-state ${tone === 'blue' ? 'is-blue' : ''}`}>{children}</span>;
}

export function ProductFrame({ title, state, children, className = '' }: { title: string; state: string; children: ReactNode; className?: string }) {
  return (
    <section className={`product-frame ${className}`} aria-label={`${title}: ${state}`}>
      <header><strong>{title}</strong><ProductState tone="blue">{state}</ProductState></header>
      <div className="product-plane">{children}</div>
    </section>
  );
}

const assets = [
  ['USDC', 'Base', 'Reserve'],
  ['ETH', 'Base', 'Core'],
  ['BTC', 'Bitcoin', 'Growth'],
] as const;

export function CapitalSystemVisual() {
  return (
    <div className="capital-system-visual" aria-label="Four connected Neptlium product systems">
      <strong>One capital operating view</strong>
      <div>
        {['Portfolio Intelligence', 'Capital Account', 'Treasury', 'Allocation'].map((item, index) => (
          <article key={item}><span>0{index + 1}</span><h3>{item}</h3><i aria-hidden="true" /></article>
        ))}
      </div>
    </div>
  );
}

export function OperatingModelVisual() {
  const stages = [
    ['Observe', 'Position'], ['Understand', 'Context'], ['Model', 'Scenario'], ['Review', 'Decision'], ['Authorize', 'Permission'],
  ] as const;
  return (
    <ol className="operating-model-visual" aria-label="Neptlium operating model">
      {stages.map(([stage, meaning], index) => <li key={stage}><span>0{index + 1}</span><strong>{stage}</strong><small>{meaning}</small></li>)}
    </ol>
  );
}

export function PortfolioVisual() {
  return (
    <ProductFrame title="Portfolio Intelligence" state="Illustrative structure">
      <div className="visual-heading"><div><span>Portfolio position</span><strong>—</strong></div><ProductState>Observed</ProductState></div>
      <div className="composition-band" aria-hidden="true"><i /><i /><i /></div>
      <div className="asset-structure">
        {assets.map(([asset, network, role]) => <div key={asset}><AssetIdentity asset={asset} network={network} size="md" detailed /><span>{role}</span><span>—</span></div>)}
      </div>
      <dl className="analytical-strip">
        <div><dt>Concentration</dt><dd>Observed</dd></div>
        <div><dt>Liquidity</dt><dd>Classified</dd></div>
        <div><dt>Structure</dt><dd>Defined roles</dd></div>
      </dl>
    </ProductFrame>
  );
}

export function CapitalAccountVisual() {
  return (
    <ProductFrame title="Capital Account" state="Eligibility applies">
      <div className="visual-heading"><div><span>Account position</span><strong>—</strong></div><ProductState>Provisioning</ProductState></div>
      <div className="asset-structure account-assets">
        {assets.map(([asset, network]) => <div key={asset}><AssetIdentity asset={asset} network={network} size="md" detailed /><span>Network defined</span><span>—</span></div>)}
      </div>
      <div className="account-boundary"><span>Funding</span><i aria-hidden="true" /><strong>Authorization boundary</strong><i aria-hidden="true" /><span>Movement</span></div>
      <p className="visual-disclosure">Funding becomes available only when account provisioning and eligibility permit it.</p>
    </ProductFrame>
  );
}

export function TreasuryVisual() {
  return (
    <ProductFrame title="Treasury" state="Structural view">
      <div className="treasury-tree">
        <div><span>Total capital</span><strong>—</strong></div>
        <ul>
          <li><span>Available liquidity</span><i className="liquidity-a" /><ProductState>Available</ProductState></li>
          <li><span>Reserve</span><i className="liquidity-b" /><ProductState>Reserved</ProductState></li>
          <li><span>Committed capital</span><i className="liquidity-c" /><ProductState>Defined</ProductState></li>
        </ul>
      </div>
      <div className="readiness-line"><span>Portfolio context</span><i aria-hidden="true" /><strong>Operational readiness</strong><i aria-hidden="true" /><span>Allocation decision</span></div>
    </ProductFrame>
  );
}

const allocationRoles = ['Reserve', 'Core', 'Growth', 'Opportunity', 'Restricted'] as const;
export function AllocationVisual() {
  return (
    <ProductFrame title="Allocation" state="Modeled">
      <div className="allocation-compare">
        <figure><figcaption>Current position</figcaption><div aria-hidden="true">{allocationRoles.map((role, i) => <i key={role} style={{ flex: i + 2 }} />)}</div><small>Observed</small></figure>
        <b aria-hidden="true">→</b>
        <figure><figcaption>Modeled position</figcaption><div aria-hidden="true">{allocationRoles.map((role, i) => <i key={role} style={{ flex: 6 - i }} />)}</div><small>Review required</small></figure>
      </div>
      <ul className="allocation-legend">{allocationRoles.map((role, i) => <li key={role}><i data-index={i} />{role}</li>)}</ul>
      <div className="authorization-boundary"><span>Policy context</span><span>Modeled allocation</span><strong>Authorization required</strong></div>
      <p className="modeling-rule">Modeling does not move capital.</p>
    </ProductFrame>
  );
}

export function SecurityFlowVisual() {
  const boundaries = ['Browser', 'Authenticated application', 'API authorization boundary', 'Privileged operations', 'Persistence / RLS'];
  return <ol className="security-flow" aria-label="Neptlium security architecture">{boundaries.map((item, i) => <li key={item}><span>0{i + 1}</span><strong>{item}</strong>{i < boundaries.length - 1 && <i aria-hidden="true" />}</li>)}</ol>;
}
