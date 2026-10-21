import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SettingsShell } from '@/components/settings/SettingsShell';
import { getSessionDetails } from '@/lib/account/session-details';
import { loadAccountStatus } from '@/lib/account/status';
import { requireUser } from '@/lib/auth';

const onboardingLabel = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Complete',
} as const;

const privacyLinks = [
  ['Privacy Policy', 'https://neptlium.com/privacy'],
  ['Terms of Service', 'https://neptlium.com/terms'],
  ['Cookie Policy', 'https://neptlium.com/cookie-policy'],
] as const;

function date(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null;
}

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const [session, status] = await Promise.all([getSessionDetails(), loadAccountStatus()]);
  const onboarding = status?.onboarding.state ?? null;

  return (
    <SettingsShell title="Account" description="Your sign-in details, setup progress and data.">
      <section className="op-panel" aria-labelledby="account-info-heading">
        <div className="op-section-heading">
          <div>
            <span>Account</span>
            <h2 id="account-info-heading">Account information</h2>
          </div>
        </div>
        <div className="op-settings-list">
          <div>
            <span>
              <small>Email</small>
              <strong>{session?.email ?? user.email ?? 'Not available'}</strong>
            </span>
          </div>
          <div>
            <span>
              <small>Email confirmation</small>
              <strong>
                {session
                  ? session.emailConfirmedAt
                    ? `Confirmed ${date(session.emailConfirmedAt)}`
                    : 'Not confirmed'
                  : 'Not available'}
              </strong>
            </span>
          </div>
          <div>
            <span>
              <small>Member since</small>
              <strong>{date(session?.createdAt) ?? 'Not available'}</strong>
            </span>
          </div>
          <div>
            <span>
              <small>Profile setup</small>
              <strong>{onboarding ? onboardingLabel[onboarding] : 'Not available'}</strong>
            </span>
          </div>
        </div>
        {onboarding && onboarding !== 'COMPLETED' ? (
          <Link className="op-inline-link" href="/onboarding">
            {onboarding === 'IN_PROGRESS' ? 'Continue setup' : 'Set up profile'}{' '}
            <ArrowRight size={14} />
          </Link>
        ) : null}
        {status?.standing === 'RESTRICTED' ? (
          <div className="op-empty-row mt-4">
            <strong>Your account is restricted</strong>
            <span>Some features are unavailable. Contact support for help.</span>
          </div>
        ) : null}
      </section>
      <section className="op-panel" aria-labelledby="privacy-heading">
        <div className="op-section-heading">
          <div>
            <span>Privacy</span>
            <h2 id="privacy-heading">Privacy and your data</h2>
          </div>
        </div>
        <ul className="grid gap-2 text-sm">
          {privacyLinks.map(([label, href]) => (
            <li key={href}>
              <a className="op-inline-link" href={href} target="_blank" rel="noreferrer">
                {label} <ArrowRight size={14} />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          To ask about the personal data we hold or to request its correction or deletion,{' '}
          <Link className="underline underline-offset-4" href="/dashboard/support">
            contact support
          </Link>
          .
        </p>
      </section>
    </SettingsShell>
  );
}
