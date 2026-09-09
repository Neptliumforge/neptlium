import { redirect } from 'next/navigation';
import { requireProvisionedUser } from '@/lib/auth';

export default async function CounterpartiesPage() {
  await requireProvisionedUser();
  redirect('/dashboard/treasury');
}
