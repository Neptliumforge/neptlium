import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <SignIn routing="hash" fallbackRedirectUrl="/auth/complete" signUpUrl="/auth/sign-up" />;
}
