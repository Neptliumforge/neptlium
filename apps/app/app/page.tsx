import { SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NeptliumMark } from '@neptlium/ui';

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="auth-entry">
      <div className="auth-entry-brand" aria-label="Neptlium">
        <span>Neptlium</span>
        <NeptliumMark size={34} tone="teal" />
      </div>
      <div className="auth-entry-clerk">
        <SignIn
          routing="hash"
          signUpUrl="/auth/sign-up"
          fallbackRedirectUrl="/dashboard"
          appearance={{ elements: {
            rootBox: 'w-full',
            cardBox: 'w-full shadow-none',
            card: 'w-full border-0 bg-transparent p-0 shadow-none',
            headerTitle: 'text-left text-[1.8rem] font-medium tracking-[-0.035em] text-text-primary',
            headerSubtitle: 'text-left text-sm text-text-muted',
            socialButtonsBlockButton: 'border-border-default bg-surface-1 shadow-none hover:bg-surface-2',
            formFieldInput: 'border-border-default bg-surface-1 shadow-none focus:border-[#0F8F86]',
            formButtonPrimary: 'bg-[#0F8F86] text-white shadow-none hover:bg-[#0C776F]',
            footer: 'bg-transparent',
            footerActionLink: 'text-[#0F8F86] underline-offset-4 hover:underline',
          } }}
        />
      </div>
    </main>
  );
}
