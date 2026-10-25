interface Wallet {
  id: string;
  web3Wallet: string;
  verification: { status: string | null; message: string | null };
  prepareVerification: (params: { strategy: 'web3_metamask_signature' }) => Promise<Wallet>;
  attemptVerification: (params: {
    signature: string;
    strategy: 'web3_metamask_signature';
  }) => Promise<Wallet>;
}
interface User {
  primaryEmailAddress: { verification: { status: string | null } } | null;
  web3Wallets: Wallet[];
  createWeb3Wallet: (params: { web3Wallet: string }) => Promise<Wallet>;
  reload: () => Promise<unknown>;
}
export interface Ethereum {
  request: (input: { method: string; params?: unknown[] }) => Promise<unknown>;
}
/** Clerk prepareVerification owns the nonce, wallet prompt and signature generation.
 * Its message is the resulting signature, NOT a challenge to sign a second time. */
export async function linkMetaMask(user: User, ethereum: Ethereum | undefined): Promise<void> {
  if (!ethereum || user.primaryEmailAddress?.verification.status !== 'verified')
    throw new Error('Verified email and wallet required');
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const address = Array.isArray(accounts) ? accounts[0] : null;
  if (typeof address !== 'string' || !/^0x[0-9a-f]{40}$/i.test(address))
    throw new Error('Invalid wallet');
  const wallet =
    user.web3Wallets.find((w) => w.web3Wallet.toLowerCase() === address.toLowerCase()) ??
    (await user.createWeb3Wallet({ web3Wallet: address }));
  const prepared = await wallet.prepareVerification({ strategy: 'web3_metamask_signature' });
  const signature = prepared.verification.message;
  if (!signature) throw new Error('Signature unavailable');
  const current = await ethereum.request({ method: 'eth_accounts' });
  if (!Array.isArray(current) || String(current[0]).toLowerCase() !== address.toLowerCase())
    throw new Error('Wallet changed');
  const verified = await wallet.attemptVerification({
    signature,
    strategy: 'web3_metamask_signature',
  });
  if (verified.verification.status !== 'verified') throw new Error('Ownership not verified');
  await user.reload();
}
