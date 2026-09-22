import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type { TransactionIntelligence } from './transaction-intelligence.js';

export type TransactionReconciliationState =
  | 'observed'
  | 'classified'
  | 'matched'
  | 'dismissed';

export interface TransactionObservationRecord {
  id: string;
  ownerId: string;
  walletAddress: string;
  network: string;
  txHash: string;
  source: string;
  sourceEventId: string;
  reconciliationKey: string;
  payloadDigest: string;
  observedAt: string;
  receivedAt: string;
}

export interface TransactionSemanticEventRecord {
  id: string;
  observationId: string;
  ownerId: string;
  walletAddress: string;
  network: string;
  txHash: string;
  kind: TransactionIntelligence['kind'];
  confidence: TransactionIntelligence['confidence'];
  canonical: false;
  summary: string;
  reconciliationState: TransactionReconciliationState;
  observedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionIntelligenceRepository {
  ready(): Promise<boolean>;
  ingestObservation(input: {
    ownerId: string;
    walletAddress: string;
    network: string;
    txHash: string;
    source: string;
    sourceEventId: string;
    reconciliationKey: string;
    payloadDigest: string;
    observedAt: string;
  }): Promise<{ value: TransactionObservationRecord; replayed: boolean }>;
  persistClassification(input: {
    observationId: string;
    ownerId: string;
    intelligence: TransactionIntelligence;
  }): Promise<{ value: TransactionSemanticEventRecord; replayed: boolean }>;
  listActivity(ownerId: string, limit: number): Promise<TransactionSemanticEventRecord[]>;
  updateReconciliationState(input: {
    ownerId: string;
    eventId: string;
    state: Exclude<TransactionReconciliationState, 'observed' | 'classified'>;
  }): Promise<TransactionSemanticEventRecord>;
}

type Fetch = typeof fetch;

type ObservationRow = {
  id: string;
  owner_id: string;
  wallet_address: string;
  network: string;
  tx_hash: string;
  source: string;
  source_event_id: string;
  reconciliation_key: string;
  payload_digest: string;
  observed_at: string;
  received_at: string;
};

type EventRow = {
  id: string;
  observation_id: string;
  owner_id: string;
  wallet_address: string;
  network: string;
  tx_hash: string;
  semantic_kind: TransactionIntelligence['kind'];
  confidence: TransactionIntelligence['confidence'];
  canonical: false;
  summary: string;
  reconciliation_state: TransactionReconciliationState;
  observed_at: string;
  created_at: string;
  updated_at: string;
};

function observation(row: ObservationRow): TransactionObservationRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    walletAddress: row.wallet_address,
    network: row.network,
    txHash: row.tx_hash,
    source: row.source,
    sourceEventId: row.source_event_id,
    reconciliationKey: row.reconciliation_key,
    payloadDigest: row.payload_digest,
    observedAt: row.observed_at,
    receivedAt: row.received_at,
  };
}

function event(row: EventRow): TransactionSemanticEventRecord {
  return {
    id: row.id,
    observationId: row.observation_id,
    ownerId: row.owner_id,
    walletAddress: row.wallet_address,
    network: row.network,
    txHash: row.tx_hash,
    kind: row.semantic_kind,
    confidence: row.confidence,
    canonical: false,
    summary: row.summary,
    reconciliationState: row.reconciliation_state,
    observedAt: row.observed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseTransactionIntelligenceRepository implements TransactionIntelligenceRepository {
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

  private async rows<T>(path: string, message: string): Promise<T[]> {
    const response = await this.rest(path);
    if (!response.ok) throw new ApiError(503, 'transaction_intelligence_storage_unavailable', message);
    return (await response.json()) as T[];
  }

  async ready() {
    try {
      const [inbox, events] = await Promise.all([
        this.rest('transaction_observation_inbox?select=id,reconciliation_key&limit=1'),
        this.rest('transaction_semantic_events?select=id,reconciliation_state,canonical&limit=1'),
      ]);
      return inbox.ok && events.ok;
    } catch {
      return false;
    }
  }

  async ingestObservation(input: Parameters<TransactionIntelligenceRepository['ingestObservation']>[0]): Promise<{ value: TransactionObservationRecord; replayed: boolean }> {
    const existing = await this.rows<ObservationRow>(
      `transaction_observation_inbox?owner_id=eq.${encodeURIComponent(input.ownerId)}&source=eq.${encodeURIComponent(input.source)}&source_event_id=eq.${encodeURIComponent(input.sourceEventId)}&select=*&limit=1`,
      'Transaction observation lookup is unavailable',
    );
    if (existing[0]) {
      if (
        existing[0].payload_digest !== input.payloadDigest ||
        existing[0].reconciliation_key !== input.reconciliationKey
      )
        throw new ApiError(409, 'observation_idempotency_conflict', 'Observation identity was reused with different evidence');
      return { value: observation(existing[0]), replayed: true };
    }

    const response = await this.rest('transaction_observation_inbox', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        owner_id: input.ownerId,
        wallet_address: input.walletAddress.toLowerCase(),
        network: input.network.toUpperCase(),
        tx_hash: input.txHash.toLowerCase(),
        source: input.source,
        source_event_id: input.sourceEventId,
        reconciliation_key: input.reconciliationKey,
        payload_digest: input.payloadDigest,
        observed_at: input.observedAt,
      }),
    });
    if (response.status === 409) return this.ingestObservation(input);
    if (!response.ok)
      throw new ApiError(503, 'transaction_intelligence_storage_unavailable', 'Transaction observation could not be persisted');
    return { value: observation(((await response.json()) as ObservationRow[])[0]!), replayed: false };
  }

  async persistClassification(input: Parameters<TransactionIntelligenceRepository['persistClassification']>[0]): Promise<{ value: TransactionSemanticEventRecord; replayed: boolean }> {
    const existing = await this.rows<EventRow>(
      `transaction_semantic_events?observation_id=eq.${encodeURIComponent(input.observationId)}&select=*&limit=1`,
      'Transaction classification lookup is unavailable',
    );
    if (existing[0]) return { value: event(existing[0]), replayed: true };

    const response = await this.rest('transaction_semantic_events', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        observation_id: input.observationId,
        owner_id: input.ownerId,
        wallet_address: input.intelligence.walletAddress,
        network: input.intelligence.network,
        tx_hash: input.intelligence.txHash,
        semantic_kind: input.intelligence.kind,
        confidence: input.intelligence.confidence,
        canonical: false,
        summary: input.intelligence.summary,
        reconciliation_state: 'classified',
        observed_at: input.intelligence.observedAt,
      }),
    });
    if (response.status === 409) return this.persistClassification(input);
    if (!response.ok)
      throw new ApiError(503, 'transaction_intelligence_storage_unavailable', 'Transaction classification could not be persisted');
    return { value: event(((await response.json()) as EventRow[])[0]!), replayed: false };
  }

  async listActivity(ownerId: string, limit: number) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return (
      await this.rows<EventRow>(
        `transaction_semantic_events?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=observed_at.desc&limit=${safeLimit}`,
        'Transaction activity is unavailable',
      )
    ).map(event);
  }

  async updateReconciliationState(input: Parameters<TransactionIntelligenceRepository['updateReconciliationState']>[0]) {
    const response = await this.rest(
      `transaction_semantic_events?id=eq.${encodeURIComponent(input.eventId)}&owner_id=eq.${encodeURIComponent(input.ownerId)}`,
      {
        method: 'PATCH',
        headers: { prefer: 'return=representation' },
        body: JSON.stringify({ reconciliation_state: input.state, updated_at: new Date().toISOString() }),
      },
    );
    if (!response.ok)
      throw new ApiError(503, 'transaction_intelligence_storage_unavailable', 'Transaction reconciliation state could not be updated');
    const row = ((await response.json()) as EventRow[])[0];
    if (!row) throw new ApiError(404, 'not_found', 'Transaction activity event not found');
    return event(row);
  }
}

export class MemoryTransactionIntelligenceRepository implements TransactionIntelligenceRepository {
  readonly observations = new Map<string, TransactionObservationRecord>();
  readonly events = new Map<string, TransactionSemanticEventRecord>();

  async ready() { return true; }

  async ingestObservation(input: Parameters<TransactionIntelligenceRepository['ingestObservation']>[0]) {
    const identity = `${input.ownerId}:${input.source}:${input.sourceEventId}`;
    const existing = this.observations.get(identity);
    if (existing) {
      if (existing.payloadDigest !== input.payloadDigest || existing.reconciliationKey !== input.reconciliationKey)
        throw new ApiError(409, 'observation_idempotency_conflict', 'Observation identity was reused with different evidence');
      return { value: existing, replayed: true };
    }
    const value: TransactionObservationRecord = {
      id: randomUUID(),
      ...input,
      walletAddress: input.walletAddress.toLowerCase(),
      network: input.network.toUpperCase(),
      txHash: input.txHash.toLowerCase(),
      receivedAt: new Date().toISOString(),
    };
    this.observations.set(identity, value);
    return { value, replayed: false };
  }

  async persistClassification(input: Parameters<TransactionIntelligenceRepository['persistClassification']>[0]) {
    const existing = [...this.events.values()].find((value) => value.observationId === input.observationId);
    if (existing) return { value: existing, replayed: true };
    const now = new Date().toISOString();
    const value: TransactionSemanticEventRecord = {
      id: randomUUID(),
      observationId: input.observationId,
      ownerId: input.ownerId,
      walletAddress: input.intelligence.walletAddress,
      network: input.intelligence.network,
      txHash: input.intelligence.txHash,
      kind: input.intelligence.kind,
      confidence: input.intelligence.confidence,
      canonical: false,
      summary: input.intelligence.summary,
      reconciliationState: 'classified',
      observedAt: input.intelligence.observedAt,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(value.id, value);
    return { value, replayed: false };
  }

  async listActivity(ownerId: string, limit: number) {
    return [...this.events.values()]
      .filter((value) => value.ownerId === ownerId)
      .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))
      .slice(0, Math.min(Math.max(limit, 1), 100));
  }

  async updateReconciliationState(input: Parameters<TransactionIntelligenceRepository['updateReconciliationState']>[0]) {
    const value = this.events.get(input.eventId);
    if (!value || value.ownerId !== input.ownerId)
      throw new ApiError(404, 'not_found', 'Transaction activity event not found');
    const updated = { ...value, reconciliationState: input.state, updatedAt: new Date().toISOString() };
    this.events.set(value.id, updated);
    return updated;
  }
}
