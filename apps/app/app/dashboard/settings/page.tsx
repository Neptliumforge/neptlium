import { Card, CardContent, CardHeader, CardTitle } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getAccountSettings } from '@/lib/api/client';
import { MfaEnrollment } from './MfaEnrollment';
import { RevokeSessionsButton } from './RevokeSessionsButton';

const EVENT_LABELS: Record<string, string> = {
  login: 'Signed in',
  logout: 'Signed out',
  signup: 'Account created',
  password_updated: 'Password changed',
  mfa_enrolled: 'Authenticator app enrolled',
  mfa_unenrolled: 'Authenticator app removed',
  sessions_revoked: 'Other sessions signed out',
};

const displayValue = (value: string | null | undefined, fallback = 'Not provided') =>
  value?.trim() ? value : fallback;

export default async function SettingsPage() {
  await requireProvisionedUser();
  let settings;
  try {
    settings = await getAccountSettings();
  } catch {
    settings = null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1>Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Account, security, and preference management.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {settings ? (
            <>
              <SettingValue label="Name" value={displayValue(settings.profile.fullName ?? settings.profile.displayName)} />
              <SettingValue label="Email" value={displayValue(settings.profile.email)} />
              <SettingValue label="Account purpose" value={displayValue(settings.profile.investorType, 'Not configured')} />
              <SettingValue label="Compliance status" value={displayValue(settings.profile.complianceStatus, 'Not configured')} capitalize />
            </>
          ) : (
            <p className="col-span-full text-sm text-text-muted">Account settings are unavailable. Try again later.</p>
          )}
        </CardContent>
      </Card>

      {settings?.organization && (
        <Card>
          <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <SettingValue label="Company name" value={displayValue(settings.organization.name)} />
            <SettingValue label="Your role" value={displayValue(settings.organization.role)} />
            <SettingValue label="Industry" value={displayValue(settings.organization.industry)} />
            <SettingValue label="Country" value={displayValue(settings.organization.country)} />
            <SettingValue label="Organization size" value={displayValue(settings.organization.organizationSize)} />
            {settings.organization.aumRange && <SettingValue label="Assets under management" value={settings.organization.aumRange} />}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Multi-factor authentication</CardTitle></CardHeader>
        <CardContent><MfaEnrollment /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RevokeSessionsButton />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text-secondary">Recent security activity</p>
            {settings === null ? (
              <p className="text-sm text-text-muted">Security activity is unavailable. Try again later.</p>
            ) : settings.securityActivity.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border-hairline border-y border-border-hairline">
                {settings.securityActivity.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-text-primary">{EVENT_LABELS[event.eventType] ?? event.eventType}</span>
                    <span className="text-text-muted">{new Date(event.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">No recorded security activity yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingValue({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`mt-1 text-sm text-text-primary ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
}
