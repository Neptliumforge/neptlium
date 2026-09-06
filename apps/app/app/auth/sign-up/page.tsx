import { SignUp } from '@clerk/nextjs';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

export default function SignUpPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Create access
          </p>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-text-primary">
              Create your Neptlium account
            </h1>
            <p className="text-sm leading-6 text-text-muted">
              Establish secure access to your governed capital workspace.
            </p>
          </div>
        </div>

        <div className="min-h-[460px] w-full">
          <SignUp
            routing="hash"
            fallbackRedirectUrl="/auth/complete"
            signInUrl="/auth/sign-in"
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
