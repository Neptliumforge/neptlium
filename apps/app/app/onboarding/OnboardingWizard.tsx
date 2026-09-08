'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Field, FieldError, Input, Label } from '@neptlium/ui';
import {
  onboardingPayloadSchema,
  type ProvisioningPayload,
} from '@neptlium/lib/validation';
import { OnboardingShell } from './components/OnboardingShell';
import { OnboardingPanel } from './components/OnboardingPanel';
import { getOnboardingDraft, saveOnboardingDraft, submitProvisioning } from './actions';
import { onboardingSteps } from './wizard-steps';

type DraftData = Partial<ProvisioningPayload>;

function runtimeDefaults(): Pick<ProvisioningPayload, 'timezone' | 'language'> {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: navigator.language || 'en',
  };
}

function accountDefaults(): Pick<ProvisioningPayload, 'investorType' | 'securityChoices'> {
  return {
    investorType: 'individual',
    securityChoices: [],
  };
}

export function OnboardingWizard({ email }: { readonly email: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<DraftData>(accountDefaults());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    getOnboardingDraft()
      .then((draft) => {
        const restoredStep = Math.min(Math.max(draft.stepIndex, 0), onboardingSteps.length - 1);
        setData({ ...accountDefaults(), ...runtimeDefaults(), ...draft.data });
        setStepIndex(restoredStep);
      })
      .catch(() => {
        setData((current) => ({ ...accountDefaults(), ...runtimeDefaults(), ...current }));
        setError('We could not restore your saved progress. You can continue here.');
      })
      .finally(() => setReady(true));
  }, []);

  function update<K extends keyof ProvisioningPayload>(key: K, value: ProvisioningPayload[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function persist(nextStep: number, nextData: DraftData = data) {
    await saveOnboardingDraft({ data: nextData, stepIndex: nextStep });
    setStepIndex(nextStep);
  }

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!data.firstName?.trim() || !data.lastName?.trim() || !data.country?.trim()) {
      setError('Enter your first name, last name, and country.');
      return;
    }

    const normalized: DraftData = {
      ...accountDefaults(),
      ...data,
      region: data.country,
      organizationName: '',
      companyRole: '',
      website: '',
    };
    setData(normalized);
    await persist(1, normalized).catch(() =>
      setError('Your progress could not be saved. Check your connection and try again.'),
    );
  }

  async function goBack() {
    setError(null);
    try {
      await persist(0);
    } catch {
      setError('Your progress could not be saved. Check your connection and try again.');
    }
  }

  async function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!data.acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    const completedData: DraftData = {
      ...accountDefaults(),
      ...runtimeDefaults(),
      ...data,
      investorType: 'individual',
      region: data.region?.trim() || data.country || '',
      organizationName: '',
      companyRole: '',
      website: '',
      securityChoices: data.securityChoices ?? [],
    };
    const parsed = onboardingPayloadSchema.safeParse(completedData);
    if (!parsed.success) {
      setError('Review the required information before finishing account setup.');
      return;
    }

    setProvisioning(true);
    try {
      await saveOnboardingDraft({ data: parsed.data, stepIndex: 1 });
      const result = await submitProvisioning(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      router.replace('/dashboard');
    } catch {
      setError('Account setup could not be completed. Check your connection and try again.');
    } finally {
      setProvisioning(false);
    }
  }

  if (!ready) {
    return (
      <OnboardingShell step={1} totalSteps={2}>
        <p className="text-sm text-text-muted" role="status">
          Preparing your account…
        </p>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={stepIndex + 1} totalSteps={2}>
      <OnboardingPanel>
        <div aria-live="polite" className="sr-only">
          {error ?? (provisioning ? 'Finishing account setup.' : '')}
        </div>

        {stepIndex === 0 && (
          <form onSubmit={advance} className="space-y-5">
            <Heading title="Welcome to Neptlium" copy="A few details are all we need to prepare your personal account." />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="First name"
                id="first-name"
                value={data.firstName ?? ''}
                onChange={(value) => update('firstName', value)}
                autoComplete="given-name"
              />
              <TextField
                label="Last name"
                id="last-name"
                value={data.lastName ?? ''}
                onChange={(value) => update('lastName', value)}
                autoComplete="family-name"
              />
            </div>
            <TextField
              label="Country"
              id="country"
              value={data.country ?? ''}
              onChange={(value) => update('country', value)}
              autoComplete="country-name"
            />
            <p className="text-xs text-text-muted">Signed in as {email}</p>
            <ErrorMessage error={error} />
            <Button type="submit" variant="accent" className="w-full">
              Continue
            </Button>
          </form>
        )}

        {stepIndex === 1 && (
          <form onSubmit={finish} className="space-y-6">
            <Heading title="Review your account" copy="Confirm your details and enter Neptlium." />
            <dl className="divide-y divide-border-hairline border-y border-border-default">
              <ReviewRow
                label="Name"
                value={`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()}
              />
              <ReviewRow label="Country" value={data.country ?? ''} />
              <ReviewRow label="Account" value="Personal" />
            </dl>
            <p className="text-sm leading-6 text-text-secondary">
              Organization and team settings are optional and can be added later from your account settings.
            </p>
            <label className="flex cursor-pointer gap-3 text-sm leading-5 text-text-secondary">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-[--accent-primary]"
                checked={data.acceptedTerms ?? false}
                onChange={(event) => update('acceptedTerms', event.target.checked as true)}
              />
              <span>
                I agree to the{' '}
                <Link className="neptlium-teal underline underline-offset-2" href="/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="neptlium-teal underline underline-offset-2" href="/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <ErrorMessage error={error} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={goBack} disabled={provisioning}>
                Back
              </Button>
              <Button
                type="submit"
                variant="accent"
                loading={provisioning}
                className="w-full sm:w-auto sm:min-w-48"
              >
                Enter Neptlium
              </Button>
            </div>
          </form>
        )}
      </OnboardingPanel>
    </OnboardingShell>
  );
}

function Heading({ title, copy }: { readonly title: string; readonly copy: string }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-[1.625rem] font-semibold leading-tight tracking-tight text-text-primary">
        {title}
      </h1>
      <p className="text-sm leading-5 text-text-secondary">{copy}</p>
    </div>
  );
}

function TextField({
  label,
  id,
  value,
  onChange,
  autoComplete,
}: {
  readonly label: string;
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: string;
}) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
      />
    </Field>
  );
}

function ErrorMessage({ error }: { readonly error: string | null }) {
  return error ? <FieldError role="alert">{error}</FieldError> : null;
}

function ReviewRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3 text-sm">
      <dt className="text-text-muted">{label}</dt>
      <dd className="max-w-[65%] text-right text-text-primary">{value || 'Not provided'}</dd>
    </div>
  );
}
