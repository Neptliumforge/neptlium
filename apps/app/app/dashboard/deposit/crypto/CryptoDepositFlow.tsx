'use client';

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

export function CryptoDepositFlow({
  capabilities,
  capabilityError,
}: {
  readonly capabilities: readonly Capability[];
  readonly capabilityError: boolean;
}) {
  const enabledCapabilities = useMemo(
    () => capabilities.filter((capability) => capability.state === 'ENABLED'),
    [capabilities],
  );
  const [selected, setSelected] = useState(enabledCapabilities[0]?.code ?? '');
  const [result, setResult] = useState<FundingIntentActionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedCapability = capabilities.find((capability) => capability.code === selected);

  function createInstructions() {
    if (!selected) return;
    setResult(null);
    startTransition(async () => {
      const next = await createFundingIntentAction(selected);
      setResult(next);
    });
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (capabilityError) {
    return (
      <section className="deposit-unavailable" role="alert">
        <ShieldAlert size={21} aria-hidden="true" />
        <div>
          <strong>Funding availability could not be verified.</strong>
          <p>No deposit instructions can be created until Neptlium can confirm the active funding rails.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="crypto-deposit-layout">
      <section className="crypto-deposit-options" aria-labelledby="crypto-options-title">
        <div className="deposit-section-heading">
          <div>
            <span>Step 1</span>
            <h2 id="crypto-options-title">Select a funding rail</h2>
          </div>
          <small>{enabledCapabilities.length} enabled</small>
        </div>

        <div className="crypto-rail-list" role="radiogroup" aria-label="Available crypto funding rails">
          {capabilities.map((capability) => {
            const enabled = capability.state === 'ENABLED';
            const active = selected === capability.code;
            return (
              <button
                key={capability.code}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!enabled || pending}
                className={`crypto-rail${active ? ' is-selected' : ''}${enabled ? '' : ' is-unavailable'}`}
                onClick={() => {
                  setSelected(capability.code);
                  setResult(null);
                }}
              >
                <div className="crypto-rail-symbol">{capability.asset.slice(0, 1)}</div>
                <div className="crypto-rail-copy">
                  <strong>{capability.asset}</strong>
                  <span>{networkLabel(capability.network)}</span>
                </div>
                <em>{enabled ? (active ? 'Selected' : 'Available') : capability.state.replaceAll('_', ' ').toLowerCase()}</em>
              </button>
            );
          })}
        </div>

        {!capabilities.length ? (
          <div className="investor-empty-state">
            <strong>No crypto funding rails are available.</strong>
            <p>Neptlium will not issue an address until a governed asset and network capability is verified for your account.</p>
          </div>
        ) : null}

        <button
          className="investor-primary-action deposit-continue-button"
          type="button"
          disabled={!selected || pending}
          onClick={createInstructions}
        >
          {pending ? <LoaderCircle className="deposit-spinner" size={16} aria-hidden="true" /> : null}
          {pending ? 'Creating instructions…' : 'Create deposit instructions'}
        </button>
      </section>

      <section className="crypto-deposit-instructions" aria-labelledby="crypto-instructions-title">
        <div className="deposit-section-heading">
          <div>
            <span>Step 2</span>
            <h2 id="crypto-instructions-title">Deposit instructions</h2>
          </div>
        </div>

        {!result ? (
          <div className="deposit-instruction-placeholder">
            <strong>No address issued yet.</strong>
            <p>Select an enabled asset and network, then create a governed funding intent.</p>
          </div>
        ) : result.ok ? (
          <div className="deposit-instruction-result">
            <div className="deposit-instruction-meta">
              <div><span>Asset</span><strong>{result.instructions.asset ?? selectedCapability?.asset ?? '—'}</strong></div>
              <div><span>Network</span><strong>{result.instructions.network ?? selectedCapability?.network ?? '—'}</strong></div>
              <div><span>Status</span><strong>{result.instructions.state}</strong></div>
            </div>

            {result.instructions.deposit_address ? (
              <div className="deposit-address-block">
                <span>Deposit address</span>
                <code>{result.instructions.deposit_address}</code>
                <button type="button" onClick={() => copyAddress(result.instructions.deposit_address!)}>
                  {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy address'}
                </button>
              </div>
            ) : (
              <div className="deposit-unavailable compact" role="status">
                <ShieldAlert size={18} aria-hidden="true" />
                <div>
                  <strong>Address unavailable.</strong>
                  <p>{result.instructions.reason ?? 'The provider route did not return a usable deposit address.'}</p>
                </div>
              </div>
            )}

            {result.instructions.memo_or_tag ? (
              <div className="deposit-memo-block">
                <span>Memo / tag</span>
                <code>{result.instructions.memo_or_tag}</code>
              </div>
            ) : null}

            <ol className="deposit-instruction-list">
              <li>Send only the displayed asset on the displayed network.</li>
              <li>Confirm the address in your sending wallet before authorizing the transfer.</li>
              <li>Keep the transaction hash or provider receipt after submission.</li>
              <li>Balance credit occurs only after Neptlium verifies observation, posting, settlement, and reconciliation.</li>
            </ol>

            <div className="deposit-evidence-note">
              Transaction-hash and supporting-document submission will be enabled only with the matching network observation workflow. This screen does not manufacture a completion state.
            </div>
          </div>
        ) : (
          <div className="deposit-unavailable" role="alert">
            <ShieldAlert size={20} aria-hidden="true" />
            <div>
              <strong>Deposit instructions were not created.</strong>
              <p>{result.error}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
