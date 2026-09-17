'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Check, Copy, LoaderCircle, ShieldAlert } from 'lucide-react';
import { createFundingIntentAction, type FundingIntentActionResult } from '@/app/dashboard/capital-account/actions';

type Capability = {
  readonly code: string;
  readonly asset: string;
  readonly network: string;
  readonly state: 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'INELIGIBLE';
  readonly reason?: string;
};

function networkLabel(value: string) {
  switch (value) {
    case 'BASE': return 'Base';
    case 'BITCOIN': return 'Bitcoin';
    case 'XRPL': return 'XRP Ledger';
    default: return value;
  }
}

function instructionState(state: string) {
  if (state === 'ENABLED') return 'Ready to receive';
  if (state === 'PENDING') return 'Preparing route';
  return state.replaceAll('_', ' ').toLowerCase();
}

export function CryptoDepositFlow({ capabilities, capabilityError }: { readonly capabilities: readonly Capability[]; readonly capabilityError: boolean }) {
  const enabledCapabilities = useMemo(() => capabilities.filter((capability) => capability.state === 'ENABLED'), [capabilities]);
  const [selected, setSelected] = useState(enabledCapabilities[0]?.code ?? '');
  const [result, setResult] = useState<FundingIntentActionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const selectedCapability = capabilities.find((capability) => capability.code === selected);

  function createInstructions() {
    if (!selected) return;
    setResult(null);
    startTransition(async () => setResult(await createFundingIntentAction(selected)));
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  }

  if (capabilityError) return <section className="deposit-unavailable" role="alert"><ShieldAlert size={21} aria-hidden="true"/><div><strong>Funding availability could not be verified.</strong><p>We can't safely create deposit instructions until your available funding methods can be confirmed.</p></div></section>;

  return <div className="crypto-deposit-layout">
    <section className="crypto-deposit-options" aria-labelledby="crypto-options-title">
      <div className="deposit-section-heading"><div><span>Step 1</span><h2 id="crypto-options-title">Choose what to deposit</h2></div><small>{enabledCapabilities.length} available</small></div>
      <div className="crypto-rail-list" role="radiogroup" aria-label="Available crypto deposit methods">
        {capabilities.map((capability) => {
          const isEnabled = capability.state === 'ENABLED'; const active = selected === capability.code;
          return <button key={capability.code} type="button" role="radio" aria-checked={active} disabled={!isEnabled || pending} className={`crypto-rail${active ? ' is-selected' : ''}${isEnabled ? '' : ' is-unavailable'}`} onClick={() => { setSelected(capability.code); setResult(null); }}>
            <div className="crypto-rail-symbol">{capability.asset.slice(0, 1)}</div><div className="crypto-rail-copy"><strong>{capability.asset}</strong><span>{networkLabel(capability.network)}</span></div><em>{isEnabled ? (active ? 'Selected' : 'Available') : 'Unavailable'}</em>
          </button>;
        })}
      </div>
      {!capabilities.length ? <div className="investor-empty-state"><strong>No crypto deposit methods are available.</strong><p>No address will be issued until an asset and network are available for your account.</p></div> : null}
      <button className="investor-primary-action deposit-continue-button" type="button" disabled={!selected || pending} onClick={createInstructions}>{pending ? <LoaderCircle className="deposit-spinner" size={16} aria-hidden="true"/> : null}{pending ? 'Preparing instructions…' : 'Get deposit instructions'}</button>
    </section>

    <section className="crypto-deposit-instructions" aria-labelledby="crypto-instructions-title">
      <div className="deposit-section-heading"><div><span>Step 2</span><h2 id="crypto-instructions-title">Deposit instructions</h2></div></div>
      {!result ? <div className="deposit-instruction-placeholder"><strong>No address issued yet.</strong><p>Choose an available asset and network, then request deposit instructions.</p></div> : result.ok ? <div className="deposit-instruction-result">
        <div className="deposit-instruction-meta"><div><span>Asset</span><strong>{result.instructions.asset ?? selectedCapability?.asset ?? '—'}</strong></div><div><span>Network</span><strong>{networkLabel(result.instructions.network ?? selectedCapability?.network ?? '—')}</strong></div><div><span>Status</span><strong>{instructionState(result.instructions.state)}</strong></div></div>
        {result.instructions.deposit_address ? <div className="deposit-address-block"><span>Deposit address</span><code>{result.instructions.deposit_address}</code><button type="button" onClick={() => copyAddress(result.instructions.deposit_address!)}>{copied ? <Check size={15} aria-hidden="true"/> : <Copy size={15} aria-hidden="true"/>}{copied ? 'Copied' : 'Copy address'}</button></div> : <div className="deposit-unavailable compact" role="status"><ShieldAlert size={18} aria-hidden="true"/><div><strong>Your address is not ready yet.</strong><p>Neptlium has recorded the funding request, but a usable deposit route has not been assigned. Do not send funds until an address is displayed here.</p></div></div>}
        {result.instructions.memo_or_tag ? <div className="deposit-memo-block"><span>Memo / tag</span><code>{result.instructions.memo_or_tag}</code></div> : null}
        <ol className="deposit-instruction-list"><li>Send only the asset shown above on the exact network shown above.</li><li>Confirm the address in your sending wallet before authorizing the transfer.</li><li>Keep the transaction hash or provider receipt after sending.</li><li>Your available capital updates only after the deposit is verified and reconciled.</li></ol>
        <div className="deposit-evidence-note">Creating instructions records a funding request; it does not mean funds were received. You can follow recorded changes in Activity.</div>
        <div className="mt-4 flex flex-wrap gap-2"><Link className="op-button op-button-primary" href="/dashboard/activity">View activity</Link><Link className="op-button" href="/dashboard/capital">Back to Capital</Link></div>
      </div> : <div className="deposit-unavailable" role="alert"><ShieldAlert size={20} aria-hidden="true"/><div><strong>Deposit instructions were not created.</strong><p>{result.error}</p></div></div>}
    </section>
  </div>;
}
