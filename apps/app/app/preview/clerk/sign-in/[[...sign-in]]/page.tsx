import { SignIn } from '@clerk/nextjs';
import { clerkPreviewPaths } from '@/lib/auth/clerk-preview-config';

export default function Page() {
  return <SignIn routing="path" path={clerkPreviewPaths.signIn} signUpUrl={clerkPreviewPaths.signUp} forceRedirectUrl={clerkPreviewPaths.session} />;
}
