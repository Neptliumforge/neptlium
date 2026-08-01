import { AuthPage } from '@/components/auth-page';

export default function Page() {
  return (
    <AuthPage
      eyebrow="Session expired"
      title="Your secure session has ended."
      intro="For your protection, account access requires a new authenticated session. No capital operation was authorized by this interruption."
      action="Sign in again"
      links={[
        ['Return to site', '/'],
        ['Contact support', '/contact'],
      ]}
    />
  );
}
