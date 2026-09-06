import { SignIn } from '@clerk/nextjs';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

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

        <div className="min-h-[420px] w-full">
          <SignIn
            routing="hash"
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
