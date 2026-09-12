import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { ApiClientError, getAccountContext } from '@/lib/api/client';
import { bootstrapClerkIdentity } from '@/lib/api/bootstrap';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

type CompletionEvent =
  | 'missing_clerk_session'
  | 'clerk_runtime_unavailable'
  | 'api_origin_invalid'
  | 'api_unreachable'
  | 'api_timeout'
  | 'identity_bootstrap_unavailable'
  | 'identity_migration_pending'
  | 'token_rejected'
  | 'account_context_unavailable'
  | 'account_not_provisioned'
  | 'unexpected_auth_completion_failure';

function logCompletion(event: CompletionEvent, error?: unknown) {
  const detail = error instanceof ApiClientError
    ? { code: error.code, status: error.status, requestId: error.requestId ?? null }
    : {};
  const method = event === 'missing_clerk_session' || event === 'identity_migration_pending' || event === 'account_not_provisioned'
    ? console.info
    : console.error;
  method('[auth.complete]', { event, ...detail });
}

function classifyApiFailure(error: ApiClientError, phase: 'bootstrap' | 'context'): CompletionEvent {
  if (error.code === 'api_not_configured' || error.code === 'invalid_api_origin') return 'api_origin_invalid';
  if (error.code === 'api_timeout') return 'api_timeout';
  if (error.code === 'api_unavailable') return 'api_unreachable';
  if (error.status === 401 || error.code === 'session_expired') return 'token_rejected';
  if (phase === 'bootstrap' || error.code === 'identity_bootstrap_unavailable') return 'identity_bootstrap_unavailable';
  return 'account_context_unavailable';
}

function FailureState({ migrationPending = false }: { readonly migrationPending?: boolean }) {
  return (
    <AuthShell>
      <div className="space-y-3" role="alert" aria-live="polite">
        <h1 className="text-2xl font-medium text-text-primary">
          {migrationPending ? 'Account access is being migrated' : 'Account setup unavailable'}
        </h1>
        <p className="text-sm leading-6 text-text-muted">
          {migrationPending
            ? 'Your Clerk session is valid, but the account identity mapping has not completed yet. No legacy password is required.'
            : 'We could not complete secure account setup. Please try again.'}
        </p>
      </div>
    </AuthShell>
  );
}

export default async function CompleteAuthenticationPage() {
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch (error) {
    logCompletion('clerk_runtime_unavailable', error);
    return <FailureState />;
  }

  if (!userId) {
    logCompletion('missing_clerk_session');
    redirect('/auth/sign-in');
  }

  let destination: '/dashboard' | '/onboarding';
  let phase: 'bootstrap' | 'context' = 'bootstrap';

  try {
    const bootstrap = await bootstrapClerkIdentity();
    // Compatibility only while the forward Clerk-only identity migration is being applied.
    // Never fall back to a second authentication provider or ask for legacy credentials.
    if (bootstrap.status === 'link_required') {
      logCompletion('identity_migration_pending');
      return <FailureState migrationPending />;
    }

    phase = 'context';
    const context = await getAccountContext();
    if (context.provisionedAt) {
      destination = '/dashboard';
    } else {
      logCompletion('account_not_provisioned');
      destination = '/onboarding';
    }
  } catch (error) {
    if (error instanceof ApiClientError) logCompletion(classifyApiFailure(error, phase), error);
    else logCompletion('unexpected_auth_completion_failure', error);
    return <FailureState />;
  }

  // next/navigation redirects throw internally. Keep this outside the catch above.
  redirect(destination);
}
