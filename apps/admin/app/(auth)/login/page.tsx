import { SignIn } from '@clerk/nextjs';

export default function AdminLoginPage() {
  return <SignIn routing="hash" fallbackRedirectUrl="/dashboard" />;
}
