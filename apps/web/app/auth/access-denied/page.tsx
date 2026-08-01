import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Access denied"
      title="This account action is not available."
      intro="The requested resource may require additional authorization, eligibility or an active account session."
      action="Return to Neptlium"
      links={[
        ['Sign in', '/auth/sign-in'],
        ['Contact support', '/contact'],
      ]}
    />
  );
}
