import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Sign in"
      title="Return to your account."
      intro="Sign in through the secure Neptlium application. Authentication and account controls are handled separately from this public site."
      action="Continue securely"
      links={[
        ['Create an account', '/auth/create-account'],
        ['Forgot password', '/auth/forgot-password'],
        ['Return to site', '/'],
      ]}
    />
  );
}
