import { SettingsShell } from '@/components/settings/SettingsShell';
import { IdentityVerificationPanel } from '@/components/settings/IdentityVerificationPanel';
import { loadAccountStatus } from '@/lib/account/status';
import { requireUser } from '@/lib/auth';

export default async function VerificationSettingsPage() {
  await requireUser();
  const status = await loadAccountStatus();
  return (
    <SettingsShell
      title="Identity verification"
      description="Verification is separate from signing in and from setting up your profile."
    >
      <IdentityVerificationPanel status={status} />
      <section className="op-panel" aria-labelledby="verification-about-heading">
        <div className="op-section-heading">
          <div>
            <span>About</span>
            <h2 id="verification-about-heading">How verification works</h2>
          </div>
        </div>
        <ul className="grid gap-2 text-sm leading-6 text-text-secondary">
          <li>
            You can use your dashboard and manage your profile without verifying your identity.
          </li>
          <li>Your status here only changes when Neptlium records a verification result.</li>
          <li>Confirming your email or finishing profile setup doesn’t verify your identity.</li>
        </ul>
      </section>
    </SettingsShell>
  );
}
