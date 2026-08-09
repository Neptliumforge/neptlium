'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button, Field, FieldError, Input, Label } from '@neptlium/ui';
import {
  onboardingPayloadSchema,
  type InvestorType,
  type ProvisioningPayload,
} from '@neptlium/lib';
import { OnboardingShell } from './components/OnboardingShell';
import { OnboardingPanel } from './components/OnboardingPanel';
import { getOnboardingDraft, saveOnboardingDraft, submitProvisioning } from './actions';
import { onboardingSteps } from './wizard-steps';

type DraftData = Partial<ProvisioningPayload>;

const accountTypes: ReadonlyArray<{ value: InvestorType; label: string }> = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'family_office', label: 'Family office' },
  { value: 'treasury_team', label: 'Treasury team' },
  { value: 'investment_firm', label: 'Investment firm' },
];

function requiresOrganization(type: InvestorType | undefined): boolean {
  return Boolean(type && type !== 'individual');
}

function runtimeDefaults(): Pick<ProvisioningPayload, 'timezone' | 'language'> {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: navigator.language || 'en',
  };
}

export function OnboardingWizard({ email }: { readonly email: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<DraftData>({ securityChoices: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    getOnboardingDraft()
      .then((draft) => {
        const restoredStep = Math.min(Math.max(draft.stepIndex, 0), onboardingSteps.length - 1);
        setData({ securityChoices: [], ...runtimeDefaults(), ...draft.data });
        setStepIndex(restoredStep);
      })
      .catch(() => {
        setData((current) => ({ ...runtimeDefaults(), ...current }));
        setError('We could not restore your saved progress. You can continue here.');
      })
      .finally(() => setReady(true));
  }, []);

  function update<K extends keyof ProvisioningPayload>(key: K, value: ProvisioningPayload[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function selectAccountType(value: InvestorType) {
    setData((current) => ({
      ...current,
      investorType: value,
      ...(value === 'individual' ? { organizationName: '', companyRole: '', website: '' } : {}),
    }));
  }

  async function persist(nextStep: number, nextData: DraftData = data) {
    await saveOnboardingDraft({ data: nextData, stepIndex: nextStep });
    setStepIndex(nextStep);
  }

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (stepIndex === 0) {
      if (!data.firstName?.trim() || !data.lastName?.trim() || !data.country?.trim()) {
        setError('Enter your first name, last name, and country.');
        return;
      }
      const normalized = { ...data, region: data.country };
      setData(normalized);
      await persist(1, normalized).catch(() =>
        setError('Your progress could not be saved. Check your connection and try again.'),
      );
      return;
    }

    if (stepIndex === 1) {
      if (!data.investorType) {
        setError('Select an account type.');
        return;
      }
      const nextStep = requiresOrganization(data.investorType) ? 2 : 3;
      await persist(nextStep).catch(() =>
        setError('Your progress could not be saved. Check your connection and try again.'),
      );
      return;
    }

    if (stepIndex === 2) {
      if (!data.organizationName?.trim()) {
        setError('Enter your organization name.');
        return;
      }
      await persist(3).catch(() =>
        setError('Your progress could not be saved. Check your connection and try again.'),
      );
    }
  }

  async function goBack() {
    setError(null);
    const previous =
      stepIndex === 3 && !requiresOrganization(data.investorType) ? 1 : Math.max(0, stepIndex - 1);
    try {
      await persist(previous);
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
      ...runtimeDefaults(),
      ...data,
      region: data.region?.trim() || data.country || '',
      securityChoices: data.securityChoices ?? [],
    };
    const parsed = onboardingPayloadSchema.safeParse(completedData);
    if (!parsed.success) {
      setError('Review the required information before finishing account setup.');
      return;
    }

    setProvisioning(true);
    try {
      await saveOnboardingDraft({ data: parsed.data, stepIndex: 3 });
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
      <OnboardingShell step={1} totalSteps={4}>
        <p className="text-sm text-text-muted" role="status">
          Loading your account…
        </p>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={stepIndex + 1} totalSteps={4}>
      <OnboardingPanel>
        <div aria-live="polite" className="sr-only">
          {error ?? (provisioning ? 'Finishing account setup.' : '')}
        </div>

        {stepIndex === 0 && (
          <form onSubmit={advance} className="space-y-5">
            <Heading title="Your details" copy="Tell us who will use this account." />
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
          <form onSubmit={advance} className="space-y-5">
            <Heading
              title="Account type"
              copy="Choose the option that best describes this account."
            />
            <div className="space-y-2" role="radiogroup" aria-label="Account type">
              {accountTypes.map((option) => {
                const selected = data.investorType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => selectAccountType(option.value)}
                    className={`flex min-h-12 w-full items-center justify-between rounded-sm border px-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] ${selected ? 'border-accent-primary bg-accent-primary/8 text-text-primary' : 'border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'}`}
                  >
                    {option.label}
                    <span
                      className={`flex size-5 items-center justify-center rounded-full border ${selected ? 'border-accent-primary bg-accent-primary text-canvas' : 'border-border-strong'}`}
                    >
                      {selected && <Check className="size-3" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <ErrorMessage error={error} />
            <Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 2 && (
          <form onSubmit={advance} className="space-y-5">
            <Heading
              title="Organization"
              copy="Add the organization associated with this account."
            />
            <TextField
              label="Organization name"
              id="organization"
              value={data.organizationName ?? ''}
              onChange={(value) => update('organizationName', value)}
              autoComplete="organization"
            />
            <TextField
              label="Your role (optional)"
              id="company-role"
              value={data.companyRole ?? ''}
              onChange={(value) => update('companyRole', value)}
              autoComplete="organization-title"
            />
            <TextField
              label="Website (optional)"
              id="website"
              value={data.website ?? ''}
              onChange={(value) => update('website', value)}
              autoComplete="url"
              placeholder="https://example.com"
            />
            <ErrorMessage error={error} />
            <Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 3 && (
          <form onSubmit={finish} className="space-y-6">
            <Heading title="Review" copy="Confirm your details before finishing account setup." />
            <dl className="divide-y divide-border-hairline border-y border-border-default">
              <ReviewRow
                label="Name"
                value={`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()}
              />
              <ReviewRow label="Country" value={data.country ?? ''} />
              <ReviewRow
                label="Account type"
                value={accountTypes.find((type) => type.value === data.investorType)?.label ?? ''}
              />
              {requiresOrganization(data.investorType) && (
                <ReviewRow label="Organization" value={data.organizationName ?? ''} />
              )}
            </dl>
            <label className="flex cursor-pointer gap-3 text-sm leading-5 text-text-secondary">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-[--accent-primary]"
                checked={data.acceptedTerms ?? false}
                onChange={(event) => update('acceptedTerms', event.target.checked as true)}
              />
              <span>
                I agree to the{' '}
                <Link className="text-accent-primary underline underline-offset-2" href="/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="text-accent-primary underline underline-offset-2" href="/privacy">
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
                Finish account setup
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
  placeholder,
}: {
  readonly label: string;
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: string;
  readonly placeholder?: string;
}) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </Field>
  );
}

function ErrorMessage({ error }: { readonly error: string | null }) {
  return error ? <FieldError role="alert">{error}</FieldError> : null;
}

function Actions({ onBack }: { readonly onBack: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="ghost" onClick={onBack}>
        Back
      </Button>
      <Button type="submit" variant="accent" className="w-full sm:w-auto sm:min-w-36">
        Continue
      </Button>
    </div>
  );
}

function ReviewRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3 text-sm">
      <dt className="text-text-muted">{label}</dt>
      <dd className="max-w-[65%] text-right text-text-primary">{value || 'Not provided'}</dd>
    </div>
  );
}
