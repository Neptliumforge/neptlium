import { clerkDevelopmentEnabled } from '@/lib/auth/provider';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';

export default async function RootPage() {
  if (clerkDevelopmentEnabled()) redirect('/auth/sign-in');
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? '/dashboard' : '/auth/sign-in');
}
