import Link from 'next/link';
import { ArrowLeft, FileLock2, ShieldCheck } from 'lucide-react';

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
        <div className="op-section-heading">
          <div>
            <span>Documents</span>
            <h2>Secure document submission</h2>
          </div>
        </div>
        <div className="op-state-focus">
          <FileLock2 size={20} />
          <div>
            <strong>Private upload service required</strong>
            <p>
              Government-ID submission will activate only through encrypted private storage,
              server-side validation, controlled access and auditable verification state.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <button
            type="button"
            className="op-button op-button-primary"
            disabled
            title="Secure identity document service is not connected"
          >
            Upload identity document
          </button>
        </div>
        <p className="op-footnote">
          Accepted document types and limits will be supplied by the governed verification service.
          No public storage bucket or browser-authored verification record is permitted.
        </p>
      </section>
    </div>
  );
}
