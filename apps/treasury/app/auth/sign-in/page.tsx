import { Suspense } from 'react';
import { SignInForm } from './sign-in-form';

export default function TreasurySignInPage() {
  return <main className="vault-auth-shell">
    <section className="vault-auth-card" aria-labelledby="treasury-sign-in-title">
      <div className="vault-brand"><strong>NEPTLIUM</strong><span>Treasury</span></div>
      <p className="vault-eyebrow">Secure access</p>
      <h1 id="treasury-sign-in-title">Sign in to Neptlium Treasury</h1>
      <p>Authentication establishes your identity. Organization membership, policy, approval and treasury authority are verified separately by server-owned systems.</p>
      <Suspense fallback={<p role="status">Preparing sign in…</p>}><SignInForm /></Suspense>
    </section>
  </main>;
}
