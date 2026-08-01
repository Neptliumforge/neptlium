import { AuthPage } from '@/components/auth-page';
export default function Page() {
  return (
    <AuthPage
      eyebrow="Account recovery"
      title="Choose a new password."
      intro="Password changes are completed through a verified recovery session. This public foundation does not handle account credentials."
      action="Save new password"
      links={[
        ['Sign in', '/auth/sign-in'],
        ['Return to site', '/'],
      ]}
    />
  );
}
