import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Verify email"
      title="Confirm your email address."
      intro="A verification message will confirm the address associated with your Neptlium account before access is enabled."
      action="Resend verification"
      links={[
        ['Sign in', '/auth/sign-in'],
        ['Return to site', '/'],
      ]}
    />
  );
}
