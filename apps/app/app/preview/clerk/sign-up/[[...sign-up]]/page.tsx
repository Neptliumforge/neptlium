import { SignUp } from '@clerk/nextjs';
import { clerkPreviewPaths } from '@/lib/auth/clerk-preview-config';

export default function Page() {
  return <SignUp routing="path" path={clerkPreviewPaths.signUp} signInUrl={clerkPreviewPaths.signIn} forceRedirectUrl={clerkPreviewPaths.session} />;
}
