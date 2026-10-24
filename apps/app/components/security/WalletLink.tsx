'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@neptlium/ui';
import { linkMetaMask, type Ethereum } from '@/lib/auth/wallet-link';
export function WalletLink() {
  const { user } = useUser();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function link() {
    if (busy || !user || user.primaryEmailAddress?.verification?.status !== 'verified') return;
    setBusy(true);
    setMessage('');
    try {
      const ethereum = (window as unknown as { ethereum?: Ethereum }).ethereum;
      await linkMetaMask(user, ethereum);
      setMessage('Wallet linked as a sign-in method. Financial permissions are unchanged.');
    } catch {
      setMessage(
        'Wallet linking could not be completed. Sign in again if verification is required. A wallet belonging to another account cannot be linked here.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="op-panel space-y-4">
      <h2 className="np-h3">Wallet sign-in</h2>
      <p className="text-sm text-text-secondary">
        Link MetaMask to this account with an ownership signature. Keep your verified email for
        recovery. Linking does not authorize funding, withdrawals or investments.
      </p>
      <ul className="text-sm">
        {user?.web3Wallets
          .filter((w) => w.verification.status === 'verified')
          .map((w) => (
            <li className="break-all" key={w.id}>
              {w.web3Wallet}
            </li>
          ))}
      </ul>
      <Button variant="outline" disabled={busy || !user} onClick={() => void link()}>
        {busy ? 'Verifying wallet…' : 'Link MetaMask'}
      </Button>
      <p className="text-xs text-text-muted">
        Never enter a recovery phrase or private key. This flow requests a signature, never a
        transaction.
      </p>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
