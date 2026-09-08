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
      <div className="space-y-7">
        <div className="space-y-2.5">
          <p className="neptlium-meta">Secure access</p>
          <h1 className="text-[1.8rem] font-medium leading-[1.08] tracking-[-0.035em] text-text-primary sm:text-[2rem]">Enter Neptlium</h1>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">Continue into your governed capital operating environment.</p>
        </div>
        <div className="w-full border-t border-border-hairline pt-6">
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
              socialButtonsBlockButton: 'border-border-default bg-transparent shadow-none hover:bg-black/[.035]',
              formFieldInput: 'border-border-default bg-white shadow-none focus:border-[#111111]',
              formButtonPrimary: 'bg-[#111111] text-white shadow-none hover:bg-[#262626]',
              footer: 'bg-transparent',
              footerActionLink: 'text-[#111111] underline-offset-4 hover:underline',
            } }}
          />
        </div>
      </div>
    </AuthShell>
  );
}
