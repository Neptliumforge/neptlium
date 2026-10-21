import { SettingsShell, TruthfulUnavailable } from '@/components/settings/SettingsShell';
import { IdentityVerificationPanel } from '@/components/settings/IdentityVerificationPanel';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { getAccountContext, type AccountContext } from '@/lib/api/client';
import { isLegalNameEditable } from '@/lib/account/identity-verification';
import { loadAccountStatus } from '@/lib/account/status';
import { requireUser } from '@/lib/auth';

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const [account, status] = await Promise.all([
    getAccountContext().catch((): AccountContext | null => null),
    loadAccountStatus(),
  ]);
  const legalNameEditable = isLegalNameEditable(status?.identity_verification);

  return (
    <SettingsShell title="Profile" description="Your name and how it appears in Neptlium.">
      <section className="op-panel" aria-labelledby="profile-details-heading">
        <div className="op-section-heading">
          <div>
            <span>Profile</span>
            <h2 id="profile-details-heading">Personal details</h2>
          </div>
        </div>
        {account ? (
          <ProfileForm
            firstName={account.firstName ?? null}
            lastName={account.lastName ?? null}
            displayName={account.displayName}
            legalNameEditable={legalNameEditable}
            legalNameLockReason={
              status
                ? 'Your legal name is locked while identity verification is pending or complete.'
                : 'Name changes are unavailable right now. Try again later.'
            }
          />
        ) : (
          <div className="op-empty-row">
            <strong>Profile unavailable</strong>
            <span>We couldn’t load your profile right now. Try again later.</span>
          </div>
        )}
        <div className="op-settings-list mt-5">
          <div>
            <span>
              <small>Email</small>
              <strong>{account?.email ?? user.email ?? 'Not available'}</strong>
            </span>
          </div>
        </div>
      </section>
      <IdentityVerificationPanel status={status} />
      {status?.standing === 'RESTRICTED' ? (
        <TruthfulUnavailable
          title="Your account is restricted"
          detail="Some features are unavailable. Contact support for help."
        />
      ) : null}
    </SettingsShell>
  );
}
