'use client';

import { useActionState } from 'react';
import { Button, Field, FieldHint, Input, Label } from '@neptlium/ui';
import { updateProfileAction, type SettingsActionState } from '@/app/dashboard/settings/actions';

const idle: SettingsActionState = { state: 'IDLE' };

export function ProfileForm({
  firstName,
  lastName,
  displayName,
  legalNameEditable,
  legalNameLockReason,
}: {
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string | null;
  readonly legalNameEditable: boolean;
  readonly legalNameLockReason: string;
}) {
  const [result, action, pending] = useActionState(updateProfileAction, idle);
  return (
    <form action={action} className="grid gap-5" aria-describedby="profile-form-result">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <Label htmlFor="profile-first-name">First name</Label>
          <Input
            id="profile-first-name"
            name="firstName"
            autoComplete="given-name"
            defaultValue={firstName ?? ''}
            maxLength={100}
            required={legalNameEditable}
            disabled={!legalNameEditable}
          />
        </Field>
        <Field>
          <Label htmlFor="profile-last-name">Last name</Label>
          <Input
            id="profile-last-name"
            name="lastName"
            autoComplete="family-name"
            defaultValue={lastName ?? ''}
            maxLength={100}
            required={legalNameEditable}
            disabled={!legalNameEditable}
          />
        </Field>
      </div>
      {legalNameEditable ? null : <FieldHint>{legalNameLockReason}</FieldHint>}
      <Field>
        <Label htmlFor="profile-display-name">Display name (optional)</Label>
        <Input
          id="profile-display-name"
          name="displayName"
          autoComplete="nickname"
          defaultValue={displayName ?? ''}
          maxLength={100}
        />
        <FieldHint>Shown in your account menu instead of your full name.</FieldHint>
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="cta" size="sm" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
        <p
          id="profile-form-result"
          className={result.state === 'ERROR' ? 'text-sm text-danger' : 'text-sm text-text-muted'}
          role={result.state === 'ERROR' ? 'alert' : 'status'}
        >
          {result.state === 'IDLE' ? '' : result.message}
        </p>
      </div>
    </form>
  );
}
