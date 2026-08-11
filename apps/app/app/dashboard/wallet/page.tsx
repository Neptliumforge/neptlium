import { requireProvisionedUser } from '@/lib/auth';
import {
  getCapitalAccountDepositAddress,
  getCapitalAccountState,
  getCapitalActivity,
} from '@/lib/api/client';
import { WalletView } from './WalletView';

export default async function WalletPage() {
  await requireProvisionedUser();

  const [stateResult, historyResult] = await Promise.allSettled([
    getCapitalAccountState(),
    getCapitalActivity({ limit: 50 }),
  ]);

  const capitalAccount = stateResult.status === 'fulfilled' ? stateResult.value : null;
  const history = historyResult.status === 'fulfilled' ? historyResult.value.data : [];

  let destination;
  if (capitalAccount?.funding.state === 'VALUE') {
    try {
      destination = await getCapitalAccountDepositAddress();
    } catch {
      destination = undefined;
    }
  }

  return (
    <WalletView
      transactions={history}
      historyError={historyResult.status === 'rejected'}
      stateError={stateResult.status === 'rejected'}
      capitalAccount={capitalAccount}
      {...(destination ? { destination } : {})}
    />
  );
}
