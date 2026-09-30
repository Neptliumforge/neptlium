import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="op-stack">
      <header className="op-page-header">
        <div>
          <p className="op-eyebrow">Identity</p>
          <h1>Identity verification</h1>
          <p>Verify your identity for eligible Neptlium Capital capabilities.</p>
        </div>
        <Link className="op-button" href="/dashboard/settings">
          <ArrowLeft size={15} />
          Settings
        </Link>
      </header>
      <section className="op-panel">
        <div className="op-state-focus">
          <ShieldCheck size={20} />
          <div>
            <strong>Verification is governed separately from account security.</strong>
            <p>
              Verification status comes from Neptlium compliance services. This page never treats a
              browser upload as verified identity.
            </p>
          </div>
        </div>
      </section>
      <section className="op-panel">
        <div className="op-state-focus">
          <ShieldCheck size={20} />
          <div>
            <strong>Verification is not currently available</strong>
            <p>When identity verification is available for your account, you will be able to continue here.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
