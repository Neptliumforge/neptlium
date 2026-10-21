import Link from 'next/link';
import { ArrowRight, UserRound } from 'lucide-react';
import type { AccountStatus } from '@/lib/api/client';
import { accountSetupPrompt } from '@/lib/account/identity-verification';

/** Non-blocking first-run guidance. The dashboard never redirects to onboarding. */
export function AccountSetupPrompt({ status }: { readonly status: AccountStatus | null }) {
  const prompt = accountSetupPrompt(status);
  if (!prompt) return null;
  return (
    <section className="op-panel" aria-labelledby="account-setup-heading">
      <div className="op-state-focus">
        <UserRound size={20} aria-hidden="true" />
        <div>
          <strong id="account-setup-heading">{prompt.title}</strong>
          <p>{prompt.detail}</p>
        </div>
      </div>
      <Link className="op-button op-button-primary mt-4" href="/onboarding">
        {prompt.cta} <ArrowRight size={14} />
      </Link>
    </section>
  );
}
