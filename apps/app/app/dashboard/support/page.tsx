import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';

const topics = [
  'Funding',
  'Withdrawals',
  'Investments',
  'Identity and verification',
  'Account security',
  'Transfers',
] as const;

export default function SupportPage() {
  return (
    <div className="op-stack">
      <header className="op-page-header">
        <div>
          <p className="op-eyebrow">Support</p>
          <h1>Help & Support</h1>
          <p>Private assistance for your Neptlium Capital account.</p>
        </div>
        <Link className="op-button" href="/dashboard">
          <ArrowLeft size={15} />
          Back
        </Link>
      </header>
      <section className="op-panel">
        <div className="op-state-focus">
          <MessageCircle size={20} />
          <div>
            <strong>How can we help?</strong>
            <p>
              Start a secure conversation about your account, funding, investments, transfers or
              verification.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <button
            className="op-button op-button-primary"
            type="button"
            disabled
            title="Secure support messaging will activate when the governed support API is connected"
          >
            Start a conversation
          </button>
        </div>
        <p className="op-footnote">
          Messaging remains unavailable until the governed support case and message service is
          connected. No browser-only support record is presented as durable.
        </p>
      </section>
      <section className="op-panel">
        <div className="op-section-heading">
          <div>
            <span>Help Center</span>
            <h2>Browse by topic</h2>
          </div>
        </div>
        <div className="op-row-list">
          {topics.map((topic) => (
            <div className="op-data-row" key={topic}>
              <span>
                <strong>{topic}</strong>
                <small>Guidance and support for your personal Capital account.</small>
              </span>
              <ShieldCheck size={16} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
