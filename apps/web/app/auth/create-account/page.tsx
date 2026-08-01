import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Create account"
      title="Begin with a governed account."
      intro="Account access is available to eligible users and may vary by jurisdiction, investor profile and supported services."
      action="Continue securely"
      links={[
        ['Sign in', '/auth/sign-in'],
        ['Return to site', '/'],
      ]}
    />
  );
}
