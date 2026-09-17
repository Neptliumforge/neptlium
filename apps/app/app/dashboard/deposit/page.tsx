import Link from 'next/link';
import { ArrowLeft, ArrowRight, Banknote, Coins, ShieldCheck } from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';
import { getFundingCapabilities } from '@/lib/api/financial';

export default async function DepositRoute() {
  await requireProvisionedUser();
  const capabilityResult = await getFundingCapabilities().catch(() => null);
  const capabilities = capabilityResult?.capabilities ?? [];
  const enabled = capabilities.filter((capability) => capability.state === 'ENABLED');

  return <div className="deposit-experience">
    <header className="deposit-header"><Link className="deposit-back-link" href="/dashboard/capital"><ArrowLeft size={15} aria-hidden="true"/> Capital</Link><p className="investor-eyebrow">Add money</p><h1>Fund your account</h1><p>Choose an available way to add money to your personal Neptlium Capital account.</p></header>
    <section className="deposit-method-grid" aria-label="Funding methods">
      <Link className="deposit-method-card" href="/dashboard/deposit/crypto"><div className="deposit-method-icon"><Coins size={22} aria-hidden="true"/></div><div><span>Crypto</span><h2>Deposit digital assets</h2><p>Choose an available asset and network, then receive deposit instructions created for your account.</p></div><div className="deposit-method-footer"><span>{capabilityResult ? `${enabled.length} method${enabled.length === 1 ? '' : 's'} available` : 'Availability unavailable'}</span><strong>Continue <ArrowRight size={15} aria-hidden="true"/></strong></div></Link>
      <div className="deposit-method-card is-disabled" aria-disabled="true"><div className="deposit-method-icon"><Banknote size={22} aria-hidden="true"/></div><div><span>USD</span><h2>Deposit U.S. dollars</h2><p>Bank and card funding are not available for this Capital account yet.</p></div><div className="deposit-method-footer"><span>Not yet available</span><strong>Unavailable</strong></div></div>
    </section>
    <section className="deposit-trust-panel" aria-label="Funding safeguards"><ShieldCheck size={20} aria-hidden="true"/><div><strong>Your balance changes only after funds are confirmed.</strong><p>Creating deposit instructions does not credit your account. Neptlium updates available capital only after the deposit has been verified and reconciled.</p></div></section>
  </div>;
}
