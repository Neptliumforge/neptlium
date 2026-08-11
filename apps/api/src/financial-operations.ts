import { ApiError } from './errors.js';
import { reconcileEvidence, type FundingState, type SettlementEvidence } from './funding-domain.js';

type Fetch = typeof fetch;

type Provider = 'stripe' | 'circle' | 'alchemy';
type Environment = 'test' | 'live';

type ReconciliationExpectation = {
  ownerId: string;
  fundingIntentId?: string;
  transferExecutionId?: string;
  environment: Environment;
  asset: string;
  amountAtomic: string;
  network?: string;
  destination?: string;
};

export class SupabaseFinancialOperations {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {}

  private headers(extra: HeadersInit = {}): HeadersInit {
    return {
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      'content-type': 'application/json',
      ...extra,
    };
  }
  private async rest(path: string, init: RequestInit = {}) {
    return this.request(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: this.headers(init.headers),
      signal: AbortSignal.timeout(8_000),
    });
  }
  private async rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const response = await this.rest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
    if (!response.ok)
      throw new ApiError(503, 'canonical_operation_failed', `Canonical operation ${name} failed`);
    return (await response.json()) as T;
  }

  async recordProviderReference(input: {
    provider: Provider;
    environment: Environment;
    providerObjectType: string;
    providerObjectId: string;
    fundingIntentId?: string;
    transferExecutionId?: string;
  }) {
    const response = await this.rest('provider_references', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        provider: input.provider,
        environment: input.environment,
        provider_object_type: input.providerObjectType,
        provider_object_id: input.providerObjectId,
        funding_intent_id: input.fundingIntentId ?? null,
        transfer_execution_id: input.transferExecutionId ?? null,
      }),
    });
    if (response.status === 409) return 'duplicate' as const;
    if (!response.ok) throw new ApiError(503, 'provider_reference_unavailable', 'Provider reference could not be persisted');
    return 'inserted' as const;
  }

  async recordWebhook(input: {
    provider: Provider;
    environment: Environment;
    providerEventId: string;
    payloadDigest: string;
    payload: unknown;
    signatureVerifiedAt: string;
  }) {
    const response = await this.rest('provider_webhook_inbox', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        provider: input.provider,
        environment: input.environment,
        provider_event_id: input.providerEventId,
        payload_digest: input.payloadDigest,
        payload: input.payload,
        signature_verified_at: input.signatureVerifiedAt,
        processing_state: 'received',
      }),
    });
    if (response.status === 409) return 'duplicate' as const;
    if (!response.ok) throw new ApiError(503, 'webhook_inbox_unavailable', 'Verified provider event could not be persisted');
    return 'inserted' as const;
  }

  async recordSettlementEvidence(input: {
    fundingIntentId?: string;
    transferExecutionId?: string;
    source: 'stripe' | 'circle' | 'alchemy' | 'chain';
    environment: Environment;
    sourceEventId?: string;
    txHash?: string;
    network?: string;
    asset: string;
    address?: string;
    memoOrTag?: string;
    amountAtomic: string;
    blockNumber?: string;
    confirmations?: number;
    evidenceState: string;
    observedAt: string;
    rawReference?: Record<string, unknown>;
  }) {
    const response = await this.rest('settlement_evidence', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        funding_intent_id: input.fundingIntentId ?? null,
        transfer_execution_id: input.transferExecutionId ?? null,
        source: input.source,
        environment: input.environment,
        source_event_id: input.sourceEventId ?? null,
        tx_hash: input.txHash ?? null,
        network: input.network ?? null,
        asset: input.asset,
        address: input.address ?? null,
        memo_or_tag: input.memoOrTag ?? null,
        amount_atomic: input.amountAtomic,
        block_number: input.blockNumber ?? null,
        confirmations: input.confirmations ?? null,
        evidence_state: input.evidenceState,
        observed_at: input.observedAt,
        raw_reference: input.rawReference ?? {},
      }),
    });
    if (response.status === 409) return { duplicate: true as const };
    if (!response.ok) throw new ApiError(503, 'settlement_evidence_unavailable', 'Settlement evidence could not be persisted');
    const rows = (await response.json()) as Array<{ id: string }>;
    return { duplicate: false as const, id: rows[0]?.id };
  }

  async recordDepositAttributionDiscrepancy(input: {
    webhookInboxId?: string;
    provider: Provider;
    environment: Environment;
    asset?: string;
    network?: string;
    depositAddress?: string;
    memoOrTag?: string;
    amountAtomic?: string;
    discrepancyCode: string;
    details?: Record<string, unknown>;
  }) {
    const response = await this.rest('deposit_attribution_discrepancies', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        webhook_inbox_id: input.webhookInboxId ?? null,
        provider: input.provider,
        environment: input.environment,
        asset: input.asset ?? null,
        network: input.network ?? null,
        deposit_address: input.depositAddress ?? null,
        memo_or_tag: input.memoOrTag ?? null,
        amount_atomic: input.amountAtomic ?? null,
        discrepancy_code: input.discrepancyCode,
        state: 'manual_review',
        details: input.details ?? {},
      }),
    });
    if (!response.ok) throw new ApiError(503, 'deposit_attribution_unavailable', 'Deposit discrepancy could not be persisted');
  }

  resolveDepositRoute(input: {
    provider: 'circle';
    environment: Environment;
    asset: string;
    network: string;
    depositAddress: string;
    memoOrTag?: string;
  }) {
    return this.rpc<Array<{ deposit_route_id: string; owner_id: string; funding_intent_id: string; treasury_destination_id: string }>>(
      'resolve_deposit_route',
      {
        p_provider: input.provider,
        p_environment: input.environment,
        p_asset: input.asset,
        p_network: input.network,
        p_deposit_address: input.depositAddress,
        p_memo_or_tag: input.memoOrTag ?? null,
      },
    );
  }

  omnibusBackingSnapshot(asset: string, network?: string) {
    return this.rpc<Array<{
      reconciled_treasury_atomic: string;
      pending_treasury_atomic: string;
      customer_settled_claims_atomic: string;
      customer_pending_claims_atomic: string;
    }>>('omnibus_backing_snapshot', { p_asset: asset, p_network: network ?? null });
  }

  async reconcile(input: ReconciliationExpectation, evidence: SettlementEvidence[]) {
    const result = reconcileEvidence(
      {
        asset: input.asset,
        amountAtomic: input.amountAtomic,
        ...(input.network ? { network: input.network } : {}),
        ...(input.destination ? { destination: input.destination } : {}),
      },
      evidence,
    );
    const run = await this.rest('reconciliation_runs', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({ scope: input.fundingIntentId ? 'funding' : 'transfer', environment: input.environment, state: 'running' }),
    });
    if (!run.ok) throw new ApiError(503, 'reconciliation_unavailable', 'Reconciliation run could not be created');
    const runId = ((await run.json()) as Array<{ id: string }>)[0]?.id;
    if (!runId) throw new ApiError(503, 'reconciliation_unavailable', 'Reconciliation run identity is unavailable');

    const item = await this.rest('reconciliation_items', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        run_id: runId,
        owner_id: input.ownerId,
        funding_intent_id: input.fundingIntentId ?? null,
        transfer_execution_id: input.transferExecutionId ?? null,
        state: result.state === 'MATCHED' ? 'matched' : 'discrepancy',
        discrepancy_codes: result.discrepancyCodes,
        provider_expectation: {
          asset: input.asset,
          amount_atomic: input.amountAtomic,
          network: input.network ?? null,
          destination: input.destination ?? null,
        },
        provider_observation: evidence,
        canonical_observation: {},
      }),
    });
    if (!item.ok) throw new ApiError(503, 'reconciliation_unavailable', 'Reconciliation result could not be persisted');
    const itemId = ((await item.json()) as Array<{ id: string }>)[0]?.id;
    await this.rest(`reconciliation_runs?id=eq.${encodeURIComponent(runId)}`, {
      method: 'PATCH',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({ state: 'completed', completed_at: new Date().toISOString() }),
    });
    return { ...result, runId, itemId };
  }

  advanceFundingOperationalState(fundingIntentId: string, nextState: FundingState) {
    return this.rpc<null>('advance_funding_operational_state', {
      p_funding_intent_id: fundingIntentId,
      p_next_state: nextState.toLowerCase(),
    });
  }
  markFundingProviderConfirmed(fundingIntentId: string, settlementEvidenceId: string) {
    return this.rpc<null>('mark_funding_provider_confirmed', {
      p_funding_intent_id: fundingIntentId,
      p_settlement_evidence_id: settlementEvidenceId,
    });
  }
  postConfirmedFundingToPending(fundingIntentId: string, requestId: string) {
    return this.rpc<string>('post_confirmed_funding_to_pending', {
      p_funding_intent_id: fundingIntentId,
      p_request_id: requestId,
    });
  }
  markFundingReconciled(fundingIntentId: string, reconciliationItemId: string) {
    return this.rpc<null>('mark_funding_reconciled', {
      p_funding_intent_id: fundingIntentId,
      p_reconciliation_item_id: reconciliationItemId,
    });
  }
  makeFundingAvailable(fundingIntentId: string, requestId: string) {
    return this.rpc<string>('make_reconciled_funding_available', {
      p_funding_intent_id: fundingIntentId,
      p_request_id: requestId,
    });
  }
  reserveTransfer(transferExecutionId: string, requestId: string, idempotencyKey: string) {
    return this.rpc<string>('reserve_transfer_capital', {
      p_transfer_execution_id: transferExecutionId,
      p_request_id: requestId,
      p_idempotency_key: idempotencyKey,
    });
  }
  markTransferSubmitted(transferExecutionId: string, providerReferenceId: string) {
    return this.rpc<null>('mark_transfer_submitted', {
      p_transfer_execution_id: transferExecutionId,
      p_provider_reference_id: providerReferenceId,
    });
  }
  markTransferProviderSettled(transferExecutionId: string, settlementEvidenceId: string) {
    return this.rpc<null>('mark_transfer_provider_settled', {
      p_transfer_execution_id: transferExecutionId,
      p_settlement_evidence_id: settlementEvidenceId,
    });
  }
  releaseTransfer(transferExecutionId: string, requestId: string, terminalState: 'failed' | 'cancelled') {
    return this.rpc<string>('release_transfer_reservation', {
      p_transfer_execution_id: transferExecutionId,
      p_request_id: requestId,
      p_terminal_state: terminalState,
    });
  }
  settleTransfer(transferExecutionId: string, requestId: string) {
    return this.rpc<string>('settle_reserved_transfer', {
      p_transfer_execution_id: transferExecutionId,
      p_request_id: requestId,
    });
  }
  markTransferReconciled(transferExecutionId: string, reconciliationItemId: string) {
    return this.rpc<null>('mark_transfer_reconciled', {
      p_transfer_execution_id: transferExecutionId,
      p_reconciliation_item_id: reconciliationItemId,
    });
  }
  reverseJournal(originalJournalId: string, sourceType: string, sourceId: string, requestId: string) {
    return this.rpc<string>('post_ledger_reversal', {
      p_original_journal_id: originalJournalId,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_request_id: requestId,
    });
  }
}
