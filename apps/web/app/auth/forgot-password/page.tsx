import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Account recovery"
      title="Reset your password securely."
      intro="Enter the account email through the secure authentication environment to receive recovery instructions."
      action="Send recovery instructions"
      links={[
        ['Sign in', '/auth/sign-in'],
        ['Return to site', '/'],
      ]}
    />
  );
}
