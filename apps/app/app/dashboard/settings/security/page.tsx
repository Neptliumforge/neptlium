import { WalletLink } from '@/components/security/WalletLink';
import { clerkDevelopmentEnabled } from '@/lib/auth/provider';
import { SettingsShell } from '@/components/settings/SettingsShell';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { SessionControls } from '@/components/settings/SessionControls';
import { getSessionDetails } from '@/lib/account/session-details';
import { requireUser } from '@/lib/auth';
import { MfaEnrollment } from '../MfaEnrollment';

export default async function SecuritySettingsPage() {
  await requireUser();
  const session = await getSessionDetails();
  return (
    <SettingsShell
      title="Security and access"
      description="Your password, sessions and sign-in protection."
    >
      {clerkDevelopmentEnabled() && <WalletLink />}
      <section className="op-panel" aria-labelledby="password-heading">
        <div className="op-section-heading">
          <div>
            <span>Password</span>
            <h2 id="password-heading">Change password</h2>
          </div>
        </div>
        <ChangePasswordForm />
      </section>
      <section className="op-panel" aria-labelledby="sessions-heading">
        <div className="op-section-heading">
          <div>
            <span>Sessions</span>
            <h2 id="sessions-heading">Where you’re signed in</h2>
          </div>
        </div>
        <SessionControls lastSignInAt={session?.lastSignInAt ?? null} />
      </section>
      <section className="op-panel">
        <div className="op-auth-settings">
          {clerkDevelopmentEnabled() ? (
            <p className="text-sm text-text-secondary">
              Authenticator enrollment is not available in this interface yet. Existing sign-in
              verification requirements still apply.
            </p>
          ) : (
            <MfaEnrollment />
          )}
        </div>
      </section>
    </SettingsShell>
  );
}
