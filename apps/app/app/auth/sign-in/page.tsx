import { SignIn } from '@clerk/nextjs';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

function AuthMountFallback() {
  return (
    <div
      className="w-full border border-border-subtle bg-surface-primary px-5 py-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-text-primary">Preparing secure access…</p>
      <p className="mt-1 text-sm leading-6 text-text-muted">
        Loading the authentication service.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Secure access
          </p>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-text-primary">
              Sign in to Neptlium
            </h1>
            <p className="text-sm leading-6 text-text-muted">
              Access your governed capital operating workspace.
            </p>
          </div>
        </div>

        <div className="w-full">
          <SignIn
            routing="hash"
            fallback={<AuthMountFallback />}
            fallbackRedirectUrl="/auth/complete"
            signUpUrl="/auth/sign-up"
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full shadow-none',
                card: 'w-full border border-border-subtle bg-surface-primary shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                footer: 'bg-transparent',
              },
            }}
          />
        </div>
      </div>
    </AuthShell>
  );
}
