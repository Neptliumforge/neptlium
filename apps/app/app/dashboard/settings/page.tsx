import Link from 'next/link';
import { SettingsExperience } from '@/components/product/RecordExperiences';
import { MfaEnrollment } from './MfaEnrollment';

export default function SettingsPage() {
  return (
    <div className="op-stack">
      <SettingsExperience />
      <section id="verification" className="op-panel">
        <div className="op-section-heading"><div><span>Identity verification</span><h2>Verify your identity</h2></div></div>
        <p className="op-settings-intro">Identity documents are separate from account-security controls. Document upload remains unavailable until encrypted private storage, server-side file validation, short-lived access and a governed verification workflow are connected.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border-default p-4"><strong className="text-sm">Passport</strong><p className="mt-1 text-xs text-text-muted">Photo page · JPEG or PNG when enabled.</p></div>
          <div className="rounded-lg border border-border-default p-4"><strong className="text-sm">Driver's licence</strong><p className="mt-1 text-xs text-text-muted">Front and back · JPEG or PNG when enabled.</p></div>
        </div>
      </section>
      <section id="security" className="op-panel">
        <div className="op-section-heading"><div><span>Authentication</span><h2>Security & access</h2></div></div>
        <p className="op-settings-intro">Manage multi-factor authentication and active Supabase Auth sessions. Authentication controls remain separate from financial authority and identity-document verification.</p>
        <div className="op-auth-settings"><MfaEnrollment /></div>
      </section>
      <section id="treasury-upgrade" className="op-panel">
        <div className="op-section-heading"><div><span>Neptlium Treasury</span><h2>Run your business finances separately</h2></div></div>
        <p className="op-settings-intro">Treasury is a separate organization workspace for business payments, liquidity, team access, approval workflows and financial controls. Starting Treasury setup does not convert or replace your personal Neptlium Capital account.</p>
        <div className="rounded-lg border border-border-default bg-surface-2 p-5">
          <span className="text-xs font-medium text-accent-primary">PROPOSED CORE PLAN</span>
          <div className="mt-2 flex items-end gap-2"><strong className="text-2xl">$49</strong><span className="pb-1 text-sm text-text-muted">/ month</span></div>
          <p className="mt-2 text-xs text-text-muted">Pricing is proposed and remains subject to commercial approval before billing is enabled.</p>
          <Link href="https://treasury.neptlium.com" className="mt-4 inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium">Explore Treasury →</Link>
        </div>
      </section>
      <section id="support" className="op-panel">
        <div className="op-section-heading"><div><span>Support</span><h2>Help & Support</h2></div></div>
        <p className="op-settings-intro">Get help with funding, withdrawals, transfers, investments, identity verification and account security.</p>
        <Link href="/dashboard/support" className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium">Open Support Center →</Link>
      </section>
    </div>
  );
}
