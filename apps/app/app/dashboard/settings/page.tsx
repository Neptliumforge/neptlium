import { Card, CardContent, CardHeader, CardTitle } from '@neptlium/ui';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { requireProvisionedUser } from '@/lib/auth';
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
  const { user, profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const { data: loginHistory } = await supabase
    .from('login_history')
    .select('id, event_type, user_agent, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: organization } = profile.organizationId
    ? await supabase
        .from('organizations')
        .select('name, role, website, industry, country, organization_size, aum_range')
        .eq('id', profile.organizationId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <header>
        <h1>Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Account, security, and preference management.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingValue label="Name" value={displayValue(profile.fullName ?? profile.displayName)} />
          <SettingValue label="Email" value={displayValue(profile.email)} />
          <SettingValue label="Account purpose" value={displayValue(profile.investorType, 'Not configured')} />
          <SettingValue label="Compliance status" value={displayValue(profile.complianceStatus, 'Not configured')} capitalize />
        </CardContent>
      </Card>

      {organization && (
        <Card>
          <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <SettingValue label="Company name" value={displayValue(organization.name)} />
            <SettingValue label="Your role" value={displayValue(organization.role)} />
            <SettingValue label="Industry" value={displayValue(organization.industry)} />
            <SettingValue label="Country" value={displayValue(organization.country)} />
            <SettingValue label="Organization size" value={displayValue(organization.organization_size)} />
            {organization.aum_range && <SettingValue label="Assets under management" value={organization.aum_range} />}
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
            {loginHistory && loginHistory.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border-hairline border-y border-border-hairline">
                {loginHistory.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-text-primary">{EVENT_LABELS[event.event_type] ?? event.event_type}</span>
                    <span className="text-text-muted">{new Date(event.created_at).toLocaleString()}</span>
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
