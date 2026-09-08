import { SignIn } from '@clerk/nextjs';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

function AuthMountFallback() {
  return (
    <div className="w-full py-8" role="status" aria-live="polite">
      <p className="text-sm font-medium text-text-primary">Preparing secure access…</p>
      <p className="mt-1 text-sm leading-6 text-text-muted">Loading the authentication service.</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="neptlium-meta">Secure access</p>
          <h1 className="text-[2rem] font-medium leading-[1.05] tracking-[-0.045em] text-text-primary sm:text-[2.35rem]">Enter Neptlium</h1>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">Continue into your governed capital operating environment.</p>
        </div>
        <div className="w-full border-t border-border-hairline pt-7">
          <SignIn
            routing="hash"
            fallback={<AuthMountFallback />}
            fallbackRedirectUrl="/auth/complete"
            signUpUrl="/auth/sign-up"
            appearance={{ elements: {
              rootBox: 'w-full',
              cardBox: 'w-full shadow-none',
              card: 'w-full border-0 bg-transparent p-0 shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-border-default bg-transparent shadow-none hover:bg-black/[.03]',
              formFieldInput: 'border-border-default bg-white/70 shadow-none focus:border-[#0f8f86]',
              formButtonPrimary: 'bg-[#111312] text-[#f4f0e8] shadow-none hover:bg-[#242724]',
              footer: 'bg-transparent',
              footerActionLink: 'text-[#0b746d] hover:text-[#0f8f86]',
            } }}
          />
        </div>
      </div>
    </AuthShell>
  );
}
