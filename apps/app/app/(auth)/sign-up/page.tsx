import { redirect } from 'next/navigation';
import { accountEntryHref, resolveReturnDestination, type ReturnSearchParams } from '../auth-utils';

export default async function LegacySignUpPage({
  searchParams,
}: {
  readonly searchParams: Promise<ReturnSearchParams>;
}) {
  redirect(accountEntryHref('sign-up', resolveReturnDestination(await searchParams)));
}
