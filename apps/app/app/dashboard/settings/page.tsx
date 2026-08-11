import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getAccountSettings } from '@/lib/api/client';
import { ProductStateMessage } from '@/components/product/ProductState';
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
    <Stack>
      <header>
        <h1>Settings</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Profile, security, organization context, and account preferences.</p>
      </header>

      <Section title="Profile">
        <div className="border-y border-border-hairline py-5">
          {settings ? (
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              <SettingValue label="Name" value={displayValue(settings.profile.fullName ?? settings.profile.displayName)} />
              <SettingValue label="Email" value={displayValue(settings.profile.email)} />
              <SettingValue label="Account purpose" value={displayValue(settings.profile.investorType, 'Not configured')} />
              <SettingValue label="Compliance status" value={displayValue(settings.profile.complianceStatus, 'Not configured')} capitalize />
            </dl>
          ) : (
            <ProductStateMessage state="ERROR" title="Account settings unavailable">Profile settings could not be loaded from the Neptlium API.</ProductStateMessage>
          )}
        </div>
      </Section>

      {settings?.organization ? (
        <Section title="Organization">
          <dl className="grid gap-x-10 gap-y-5 border-y border-border-hairline py-5 sm:grid-cols-2">
            <SettingValue label="Company name" value={displayValue(settings.organization.name)} />
            <SettingValue label="Your role" value={displayValue(settings.organization.role)} />
            <SettingValue label="Industry" value={displayValue(settings.organization.industry)} />
            <SettingValue label="Country" value={displayValue(settings.organization.country)} />
            <SettingValue label="Organization size" value={displayValue(settings.organization.organizationSize)} />
            {settings.organization.aumRange ? <SettingValue label="Reported AUM range" value={settings.organization.aumRange} /> : null}
          </dl>
        </Section>
      ) : null}

      <Section title="Security">
        <div className="divide-y divide-border-hairline border-y border-border-hairline">
          <div className="py-5">
            <p className="text-sm font-medium text-text-primary">Multi-factor authentication</p>
            <p className="mt-1 mb-4 text-sm text-text-muted">Manage the currently supported Supabase Auth MFA controls.</p>
            <MfaEnrollment />
          </div>
          <div className="py-5">
            <p className="text-sm font-medium text-text-primary">Sessions</p>
            <p className="mt-1 mb-4 text-sm text-text-muted">Revoke other authenticated sessions without changing financial authorization state.</p>
            <RevokeSessionsButton />
          </div>
        </div>
      </Section>

      <Section title="Recent security activity">
        <div className="border-y border-border-hairline">
          {settings === null ? (
            <ProductStateMessage state="UNAVAILABLE" title="Security activity unavailable" />
          ) : settings.securityActivity.length ? (
            settings.securityActivity.map((event) => (
              <div key={event.id} className="flex flex-col gap-1 border-b border-border-hairline py-4 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <span className="text-text-primary">{EVENT_LABELS[event.eventType] ?? event.eventType}</span>
                <time className="text-xs text-text-muted" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
              </div>
            ))
          ) : (
            <ProductStateMessage state="NO_ACTIVITY" title="No recorded security activity yet" />
          )}
        </div>
      </Section>
    </Stack>
  );
}

function SettingValue({ label, value, capitalize = false }: { readonly label: string; readonly value: string; readonly capitalize?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className={`mt-1.5 text-sm font-medium text-text-primary ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  );
}
