import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

function DemoTag({ children = 'Illustrative interface' }: { children?: string }) {
  return <span className="uv-demo">{children}</span>;
}

export function UnifiedHeroVisual() {
  return <div className="uv-frame uv-hero" aria-label="Illustrative Neptlium Capital and Treasury product composition">
    <header><strong>Neptlium</strong><DemoTag /></header>
    <div className="uv-dual">
      <section><span className="uv-label">Personal</span><h3>Neptlium Capital</h3><div className="uv-grid"><div><span>Capital</span><strong>State-aware</strong></div><div><span>Portfolio</span><strong>Context</strong></div><div><span>Allocation</span><strong>Governed</strong></div><div><span>Activity</span><strong>Recorded</strong></div></div></section>
      <section><span className="uv-label">Business</span><h3>Neptlium Treasury</h3><div className="uv-grid"><div><span>Treasury</span><strong>Visible</strong></div><div><span>Payments</span><strong>Controlled</strong></div><div><span>Approvals</span><strong>Explicit</strong></div><div><span>Risk</span><strong>Explainable</strong></div></div></section>
    </div>
    <SharedCoreVisual compact />
  </div>;
}

export function SharedCoreVisual({ compact = false }: { compact?: boolean }) {
  const items = ['Identity', 'Authority', 'Evidence', 'Ledger', 'Reconciliation', 'Audit'];
  return <div className={`uv-core ${compact ? 'is-compact' : ''}`} aria-label="Shared Neptlium financial control core">{items.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>)}</div>;
}

export function PersonalCapitalVisual() {
  return <div className="uv-frame" aria-label="Illustrative personal capital state"><header><strong>Capital state</strong><DemoTag /></header><div className="uv-state-three"><div><span>Available</span><strong>Ready for supported use</strong></div><div><span>Reserved</span><strong>Committed, not yet final</strong></div><div><span>Allocated</span><strong>Assigned to a position or purpose</strong></div></div><p className="uv-note">State labels describe product structure, not a real customer balance.</p></div>;
}

export function PortfolioSystemVisual() {
  const layers = ['Positions', 'Valuation context', 'Allocation', 'Activity', 'Reporting'];
  return <div className="uv-frame" aria-label="Illustrative portfolio intelligence interface"><header><strong>Portfolio intelligence</strong><DemoTag /></header><div className="uv-layers">{layers.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>)}</div><div className="uv-curve" aria-hidden="true"><svg viewBox="0 0 600 130"><path d="M8 102 C80 92 112 100 166 70 S268 42 326 64 S426 88 592 25" /></svg><span>Abstract interface line — not historical performance</span></div></div>;
}

export function AllocationLifecycleVisual() {
  const stages = ['Model', 'Review', 'Approve', 'Reserve', 'Execute', 'Reconcile'];
  return <div className="uv-frame" aria-label="Illustrative governed allocation lifecycle"><header><strong>Allocation lifecycle</strong><DemoTag /></header><ol className="uv-lifecycle">{stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong>{index < stages.length - 1 ? <ArrowRight aria-hidden="true" /> : null}</li>)}</ol><p className="uv-note">A proposal is not execution. Execution is not reconciliation.</p></div>;
}

export function TreasuryCommandVisual() {
  return <div className="uv-frame" aria-label="Illustrative Neptlium Treasury command center"><header><strong>Neptlium Treasury</strong><DemoTag /></header><div className="uv-grid uv-business-grid"><div><span>Treasury</span><strong>Liquidity state</strong></div><div><span>Payments</span><strong>Controlled lifecycle</strong></div><div><span>Approvals</span><strong>Authority visible</strong></div><div><span>Risk</span><strong>Evidence first</strong></div></div><div className="uv-attention"><ShieldCheck aria-hidden="true" /><span>Requires attention</span><strong>Review remains explicit before authority is granted</strong></div></div>;
}

export function TreasuryStateVisual() {
  return <div className="uv-frame" aria-label="Illustrative business treasury states"><header><strong>Business liquidity</strong><DemoTag /></header><div className="uv-state-four"><div><span>Available</span></div><div><span>Reserved</span></div><div><span>In transit</span></div><div><span>Pending reconciliation</span></div></div><p className="uv-note">Observed wallet or provider state does not become canonical treasury truth by display convention.</p></div>;
}

export function PaymentLifecycleVisual() {
  const stages = ['Draft', 'Preflight', 'Policy checked', 'Awaiting approval', 'Authorized', 'Submitted', 'Settled', 'Reconciled'];
  return <div className="uv-frame" aria-label="Illustrative payment lifecycle"><header><strong>Payment lifecycle</strong><DemoTag /></header><ol className="uv-timeline">{stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{stage}</strong></li>)}</ol></div>;
}

export function ApprovalPolicyVisual() {
  return <div className="uv-frame" aria-label="Illustrative approval policy"><header><strong>Approval policy</strong><DemoTag>Illustrative policy</DemoTag></header><div className="uv-policy"><div><span>Lower-value payment</span><strong>Finance Manager</strong></div><div><span>Mid-value payment</span><strong>Manager + Controller</strong></div><div><span>Higher-value payment</span><strong>CFO review</strong></div></div><p className="uv-note">Example logic only. Actual policy depends on the organization and configured authority.</p></div>;
}

export function PreflightVisual() {
  return <div className="uv-frame" aria-label="Illustrative transaction preflight"><header><strong>Transaction preflight</strong><DemoTag /></header><dl className="uv-details"><div><dt>From</dt><dd>Operations Treasury</dd></div><div><dt>To</dt><dd>Approved vendor</dd></div><div><dt>Asset</dt><dd>USDC</dd></div><div><dt>Network</dt><dd>Base</dd></div></dl><div className="uv-result"><CheckCircle2 aria-hidden="true" /><div><span>Simulation</span><strong>Passed</strong></div></div><p className="uv-note">Illustrative workflow. Asset, network and execution availability depend on supported product state.</p></div>;
}

export function RiskEvidenceVisual() {
  const facts = [['New counterparty', 'Review'], ['Unusual amount', 'Review'], ['Known contract', 'Evidence'], ['Simulation passed', 'Evidence'], ['Unexpected token permission', 'None observed']];
  return <div className="uv-frame" aria-label="Illustrative risk evidence"><header><strong>Risk evidence</strong><DemoTag /></header><div className="uv-risk">{facts.map(([fact, state]) => <div key={fact}><span>{fact}</span><strong>{state}</strong></div>)}</div><p className="uv-note">Risk state should expose supporting evidence instead of relying on an unexplained score.</p></div>;
}

export function ActivityDocumentsVisual() {
  const rows = ['Funding received', 'Settlement confirmed', 'Capital reconciled', 'Allocation approved', 'Statement generated'];
  return <div className="uv-frame" aria-label="Illustrative activity and document record"><header><strong>Activity + documents</strong><DemoTag>Illustrative lifecycle</DemoTag></header><ol className="uv-timeline">{rows.map((row, index) => <li key={row}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{row}</strong>{index === rows.length - 1 ? <FileText aria-hidden="true" /> : null}</li>)}</ol></div>;
}

export function AuditTrailVisual() {
  const rows = ['Payment created', 'Policy evaluated', 'Approval granted', 'Wallet authorization', 'Transaction submitted', 'Settlement confirmed', 'Reconciliation completed'];
  return <div className="uv-frame" aria-label="Illustrative business audit trail"><header><strong>Audit trail</strong><DemoTag /></header><ol className="uv-timeline">{rows.map((row, index) => <li key={row}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{row}</strong></li>)}</ol></div>;
}
