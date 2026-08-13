import { redirect } from 'next/navigation';

export default function WithdrawRoute() {
  redirect('/dashboard/wallet');
}
