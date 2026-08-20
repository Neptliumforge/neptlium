import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return <SignUp routing="hash" fallbackRedirectUrl="/auth/complete" signInUrl="/auth/sign-in" />;
}
