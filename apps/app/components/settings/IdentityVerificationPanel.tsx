import { ShieldCheck } from 'lucide-react';
import { Badge } from '@neptlium/ui';
import type { AccountStatus } from '@/lib/api/client';
import {
  presentIdentityVerification,
  type VerificationTone,
} from '@/lib/account/identity-verification';
import { StartVerificationButton } from './StartVerificationButton';

const badgeTone: Record<VerificationTone, 'neutral' | 'info' | 'success' | 'warning'> = {
  neutral: 'neutral',
  pending: 'info',
  positive: 'success',
  attention: 'warning',
};

export function IdentityVerificationPanel({ status }: { readonly status: AccountStatus | null }) {
  const view = presentIdentityVerification(status?.identity_verification ?? null);
  return (
    <section className="op-panel" id="verify-identity" aria-labelledby="verify-identity-heading">
      <div className="op-section-heading">
        <div>
          <span>Identity</span>
          <h2 id="verify-identity-heading">Verify your identity</h2>
        </div>
        {view.status ? <Badge tone={badgeTone[view.tone]}>{view.status}</Badge> : null}
      </div>
      <div className="op-state-focus">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>{view.title}</strong>
          <p>{view.detail}</p>
        </div>
      </div>
      {view.action ? <StartVerificationButton label={view.action.label} /> : null}
    </section>
  );
}
