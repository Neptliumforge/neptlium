import { Section, Stack } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
import { getAccountSettings } from '@/lib/api/client';
import { getTheses } from '@/lib/api/thesis';
import { ProductStateMessage } from '@/components/product/ProductState';
import { MfaEnrollment } from './MfaEnrollment';

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
const strategyLabel = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function SettingsPage() {
  await requireProvisionedUser();
  const [settingsResult, thesisResult] = await Promise.allSettled([getAccountSettings(), getTheses()]);
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
  const thesisState = thesisResult.status === 'fulfilled' ? thesisResult.value : null;
  const thesisBundle = thesisState?.data.find((item) => item.thesis.isDefault) ?? thesisState?.data[0] ?? null;

  return (
    <Stack>
      <header>
        <h1>Settings</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Profile, institutional decision context, security, and account preferences.</p>
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

      <Section title="Investment thesis">
        <div className="border-y border-border-hairline py-5">
          {thesisState === null ? (
            <ProductStateMessage state="UNAVAILABLE" title="Thesis unavailable">The institutional thesis service could not be reached.</ProductStateMessage>
          ) : thesisBundle ? (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{thesisBundle.thesis.name}</p>
                  <p className="mt-1 text-sm text-text-muted">{strategyLabel(thesisBundle.thesis.strategy)} · Version {thesisBundle.thesis.version}</p>
                </div>
                <span className="text-xs text-text-muted">{thesisBundle.criteria.length} governed {thesisBundle.criteria.length === 1 ? 'criterion' : 'criteria'}</span>
              </div>
              <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <SettingValue label="Sectors" value={thesisBundle.thesis.sectors.length ? thesisBundle.thesis.sectors.join(', ') : 'Unrestricted'} />
                <SettingValue label="Geographies" value={thesisBundle.thesis.geographies.length ? thesisBundle.thesis.geographies.join(', ') : 'Unrestricted'} />
              </dl>
              <p className="mt-5 max-w-2xl text-xs leading-5 text-text-muted">This thesis is the governed decision context used by Neptlium Thesis Fit. Missing evidence remains unknown rather than being inferred.</p>
            </div>
          ) : (
            <ProductStateMessage state="NO_ACTIVITY" title="No investment thesis configured">Thesis Mode is ready. A governed thesis can now be created through the Neptlium API without changing existing product behavior.</ProductStateMessage>
          )}
        </div>
      </Section>

      <Section title="Security">
        <div className="divide-y divide-border-hairline border-y border-border-hairline">
          <div className="py-5">
            <p className="text-sm font-medium text-text-primary">Multi-factor authentication</p>
            <p className="mt-1 mb-4 text-sm text-text-muted">Manage Clerk authentication, passkeys, multi-factor authentication, and active sessions.</p>
            <MfaEnrollment />
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
