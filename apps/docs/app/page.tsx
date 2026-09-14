const sections = [
  ['Overview', 'Available', 'Product-family boundaries, environments and shared API authority.'],
  ['Authentication', 'Available', 'Customer and organization authentication boundaries.'],
  ['API', 'Available', 'Shared api.neptlium.com contract and namespace conventions.'],
  ['Errors', 'Available', 'Error shape, safe failure and retry expectations.'],
  ['Idempotency', 'Available', 'Request identity and replay-safe command guidance.'],
  ['Webhooks', 'Available', 'Signed provider ingress and replay-safe event handling.'],
  ['Payments', 'Planned', 'Business payment lifecycle. Execution is not production-supported yet.'],
  ['Treasury', 'Beta', 'Capital and treasury projections that are already exposed safely.'],
  ['Approvals', 'Planned', 'Organization approval contracts are not yet production-authoritative.'],
  ['Reconciliation', 'Available', 'Evidence, posting and reconciliation concepts.'],
  ['Audit', 'Beta', 'Append-only audit and activity semantics.'],
  ['SDKs / Examples', 'Planned', 'Examples will publish only when stable contracts exist.'],
] as const;

export default function DeveloperDocsHome() {
  return <div className="docs-shell"><aside className="docs-nav"><div className="docs-brand">NEPTLIUM<span>Developers</span></div>{sections.map(([name]) => <a key={name} href={`#${name.toLowerCase().replaceAll(' ','-').replaceAll('/','-')}`}>{name}</a>)}</aside><main className="docs-main">
    <p className="docs-eyebrow">docs.neptlium.com</p><h1 className="docs-title">Build against governed financial state.</h1><p className="docs-copy">Neptlium Developers documents only contracts that exist or are explicitly labeled Beta or Planned. No speculative endpoint is represented as live.</p>
    <div className="docs-grid">{sections.map(([name,status,detail]) => <article className="docs-card" id={name.toLowerCase().replaceAll(' ','-').replaceAll('/','-')} key={name}><strong>{name}</strong><p>{detail}</p><span className="docs-status">{status}</span></article>)}</div>
    <section className="docs-section"><h2>Shared API boundary</h2><p>Neptlium Capital, Neptlium Treasury and infrastructure products converge on <code>api.neptlium.com</code>. Product applications do not create separate authority APIs.</p><pre>{`GET /v1/account\nGET /v1/capital\nGET /v1/portfolio\n\n# Business namespaces are documented only when implemented\n/v1/organizations\n/v1/treasury\n/v1/payments\n/v1/approvals`}</pre></section>
    <section className="docs-section"><h2>Production truth</h2><p>Unknown is not zero. Provider observation is not canonical balance. Authorization is not execution. Submitted is not settled. Settled is not necessarily reconciled.</p></section>
  </main></div>;
}
