import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { requireProvisionedUser } from '@/lib/auth';
import { WalletView, type WalletTransaction } from './WalletView';
import { apiRequest } from '@/lib/api/client';
export default async function WalletPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('id,type,asset,network,amount,status,created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50);
  let capitalAccount;
  try {
    const [destination, balance] = await Promise.all([
      apiRequest<{
        asset: 'USDC';
        network: 'BASE-SEPOLIA';
        address: string;
        provider_state: string;
        environment: 'testnet';
      }>('/v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA'),
      apiRequest<{
        balances: Array<{
          asset: 'USDC';
          network: 'BASE-SEPOLIA';
          available: string;
          observedAt: string;
          synchronizationState: 'provider_observed';
        }>;
        reconciliation_state: string;
      }>('/v1/capital-account/balances'),
    ]);
    capitalAccount = {
      destination,
      ...(balance.balances[0] ? { balance: balance.balances[0] } : {}),
    };
  } catch {
    capitalAccount = undefined;
  }
  return (
    <WalletView
      transactions={(data ?? []) as WalletTransaction[]}
      historyError={Boolean(error)}
      {...(capitalAccount ? { capitalAccount } : {})}
    />
  );
}
