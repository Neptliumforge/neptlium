import { AuthPage } from '@/components/auth-page';

export default function Page() {
  return (
    <AuthPage
      eyebrow="Secure access"
      title="Preparing your account environment."
      intro="The secure account environment is loading. Please wait while access and authorization boundaries are checked."
      action="Return to Neptlium"
      links={[['Contact support', '/contact']]}
    />
  );
}
