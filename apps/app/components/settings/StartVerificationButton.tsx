'use client';

import { useActionState } from 'react';
import { Button } from '@neptlium/ui';
import {
  startIdentityVerificationAction,
  type SettingsActionState,
} from '@/app/dashboard/settings/actions';

const idle: SettingsActionState = { state: 'IDLE' };

export function StartVerificationButton({ label }: { readonly label: string }) {
  const [result, action, pending] = useActionState(startIdentityVerificationAction, idle);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-3">
      <Button type="submit" variant="cta" size="sm" disabled={pending}>
        {pending ? 'Starting…' : label}
      </Button>
      {result.state === 'ERROR' ? (
        <p className="text-sm text-danger" role="alert">
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
