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
              Find guidance for your account, funding, investments, transfers or verification.
            </p>
          </div>
        </div>
        <p className="op-footnote">
          In-app messaging is not currently available. Browse the help topics below for account guidance.
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
