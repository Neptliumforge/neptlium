import { Suspense } from 'react';
import { SignInForm } from './sign-in-form';

export default function VaultSignInPage() {
  return <main className="vault-auth-shell">
    <section className="vault-auth-card" aria-labelledby="vault-sign-in-title">
      <div className="vault-brand"><strong>NEPTLIUM</strong><span>VaultRail</span></div>
      <p className="vault-eyebrow">Secure access</p>
      <h1 id="vault-sign-in-title">Sign in to VaultRail</h1>
      <p>Authentication establishes your identity. Organization membership, policy, approval and treasury authority are verified separately by server-owned systems.</p>
      <Suspense fallback={<p role="status">Preparing sign in…</p>}><SignInForm /></Suspense>
    </section>
  </main>;
}
