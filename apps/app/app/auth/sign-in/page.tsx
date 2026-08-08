import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { LoginForm } from '@/app/(auth)/login/LoginForm';
import { safeInternalPath } from '@/app/(auth)/auth-utils';

export default async function SignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  const params = await searchParams;
  return (
    <LoginForm
      next={safeInternalPath(params.next, '')}
      callbackFailed={params.error === 'confirmation_failed'}
    />
  );
}
