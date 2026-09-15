import Link from 'next/link';

const topics = ['Funding', 'Withdrawals', 'Investments', 'Identity & verification', 'Account security', 'Transfers'];

export default function SupportPage() {
  return (
    <div className="op-stack">
      <header className="op-page-header"><div><p className="op-eyebrow">Support</p><h1>Help & Support</h1><p>Get help with your personal Neptlium Capital account.</p></div></header>
      <section className="op-panel">
        <div className="op-section-heading"><div><span>Conversation</span><h2>How can we help?</h2></div></div>
        <p className="op-settings-intro">Start a secure support conversation. Never include passwords, recovery codes, private keys, API keys or wallet secrets.</p>
        <div className="mt-5 rounded-lg border border-border-default bg-surface-2 p-4">
          <label htmlFor="support-message" className="text-sm font-medium text-text-primary">Message</label>
          <textarea id="support-message" rows={5} disabled placeholder="Secure support messaging is being connected." className="mt-2 w-full rounded-md border border-border-default bg-surface-1 p-3 text-sm text-text-primary disabled:opacity-70" />
          <p className="mt-2 text-xs text-text-muted">Messaging remains unavailable until durable support-case persistence and operator routing are connected.</p>
        </div>
      </section>
      <section className="op-panel">
        <div className="op-section-heading"><div><span>Help Center</span><h2>Browse by topic</h2></div></div>
        <div className="grid gap-2 sm:grid-cols-2">{topics.map((topic) => <div key={topic} className="rounded-lg border border-border-default p-4"><strong className="text-sm">{topic}</strong><p className="mt-1 text-xs text-text-muted">Guidance will appear here as the support knowledge base is published.</p></div>)}</div>
      </section>
      <p className="text-sm text-text-muted"><Link href="/dashboard/settings" className="text-accent-primary">Back to account settings</Link></p>
    </div>
  );
}
