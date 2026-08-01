import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Maintenance"
      title="The account environment is being maintained."
      intro="The public Neptlium site remains available. Please return shortly to continue through the secure account environment."
      action="Return to Neptlium"
      links={[['Contact support', '/contact']]}
    />
  );
}
