import { createHash, randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type {
  FundingState,
  ProviderEnvironment,
  TransferExecutionState,
} from './funding-domain.js';

type Fetch = typeof fetch;

export interface CanonicalBalance {
  asset: string;
  network: string | null;
  totalAtomic: string;
  availableAtomic: string;
  reservedAtomic: string;
  pendingAtomic: string;
  restrictedAtomic: string;
}

export interface FundingIntentRecord {
  id: string;
  ownerId: string;
  asset: string;
  network: string | null;
  rail: string;
  amountAtomic: string | null;
  state: FundingState;
  environment: ProviderEnvironment;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRouteRecord {
  id: string;
  ownerId: string;
  fundingIntentId: string;
  asset: string;
  network: string | null;
  depositAddress: string;
  memoOrTag: string | null;
  provider: 'stripe' | 'circle' | null;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  createdAt: string;
}

export interface TransferAliasRecord {
  id: string;
  ownerId: string;
  alias: string;
  destinationType: string;
  destinationReference: string;
  verificationState: 'unverified' | 'pending' | 'verified' | 'failed';
  activationState: 'inactive' | 'active' | 'suspended' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface TransferExecutionRecord {
  id: string;
  ownerId: string;
  aliasId: string;
  asset: string;
  network: string | null;
  rail: string;
  amountAtomic: string;
  state: TransferExecutionState;
  environment: ProviderEnvironment;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRepository {
  ready(): Promise<boolean>;
  createFundingIntent(input: {
    ownerId: string;
    asset: string;
    network?: string;
    rail: string;
    amountAtomic?: string;
    environment: ProviderEnvironment;
    idempotencyKey: string;
    requestDigest: string;
  }): Promise<{ value: FundingIntentRecord; replayed: boolean }>;
  getFundingIntent(ownerId: string, id: string): Promise<FundingIntentRecord>;
  listFundingIntents(ownerId: string, limit: number): Promise<FundingIntentRecord[]>;
  getDepositRoute(ownerId: string, fundingIntentId: string): Promise<DepositRouteRecord | null>;
  getCanonicalBalances(ownerId: string): Promise<CanonicalBalance[]>;
  listAliases(ownerId: string): Promise<TransferAliasRecord[]>;
  createAlias(input: {
    ownerId: string;
    alias: string;
    destinationType: string;
    destinationReference: string;
  }): Promise<TransferAliasRecord>;
  createTransfer(input: {
    ownerId: string;
    aliasId: string;
    asset: string;
    network?: string;
    rail: string;
    amountAtomic: string;
    environment: ProviderEnvironment;
    idempotencyKey: string;
    requestDigest: string;
  }): Promise<{ value: TransferExecutionRecord; replayed: boolean }>;
  getTransfer(ownerId: string, id: string): Promise<TransferExecutionRecord>;
  listTransfers(ownerId: string, limit: number): Promise<TransferExecutionRecord[]>;
}

type FundingRow = {
  id: string;
  owner_id: string;
  asset: string;
  network: string | null;
  rail: string;
  amount_atomic: string | number | null;
  state: string;
  environment: string;
  created_at: string;
  updated_at: string;
  request_digest?: string;
};
type DepositRouteRow = {
  id: string;
  owner_id: string;
  funding_intent_id: string;
  asset: string;
  network: string | null;
  deposit_address: string;
  memo_or_tag: string | null;
  provider: 'stripe' | 'circle' | null;
  status: DepositRouteRecord['status'];
  created_at: string;
};
type AliasRow = {
  id: string;
  owner_id: string;
  alias: string;
  destination_type: string;
  destination_reference: string;
  verification_state: TransferAliasRecord['verificationState'];
  activation_state: TransferAliasRecord['activationState'];
  created_at: string;
  updated_at: string;
};
type TransferRow = {
  id: string;
  owner_id: string;
  alias_id: string;
  asset: string;
  network: string | null;
  rail: string;
  amount_atomic: string | number;
  state: string;
  environment: string;
  created_at: string;
  updated_at: string;
  request_digest?: string;
};
type PostingRow = {
  direction: 'debit' | 'credit';
  amount_atomic: string | number;
  asset: string;
  ledger_accounts: { account_code: string; account_class: string; network: string | null } | null;
};

const dbEnvironment = (value: ProviderEnvironment) => value.toLowerCase();
const domainEnvironment = (value: string): ProviderEnvironment =>
  value === 'live' ? 'LIVE' : 'TEST';
const domainFundingState = (value: string) => value.toUpperCase() as FundingState;
const domainTransferState = (value: string) => value.toUpperCase() as TransferExecutionState;

function funding(row: FundingRow): FundingIntentRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    asset: row.asset,
    network: row.network,
    rail: row.rail,
    amountAtomic: row.amount_atomic === null ? null : String(row.amount_atomic),
    state: domainFundingState(row.state),
    environment: domainEnvironment(row.environment),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function depositRoute(row: DepositRouteRow): DepositRouteRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    fundingIntentId: row.funding_intent_id,
    asset: row.asset,
    network: row.network,
    depositAddress: row.deposit_address,
    memoOrTag: row.memo_or_tag,
    provider: row.provider,
    status: row.status,
    createdAt: row.created_at,
  };
}
function alias(row: AliasRow): TransferAliasRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    alias: row.alias,
    destinationType: row.destination_type,
    destinationReference: row.destination_reference,
    verificationState: row.verification_state,
    activationState: row.activation_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function transfer(row: TransferRow): TransferExecutionRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    aliasId: row.alias_id,
    asset: row.asset,
    network: row.network,
    rail: row.rail,
    amountAtomic: String(row.amount_atomic),
    state: domainTransferState(row.state),
    environment: domainEnvironment(row.environment),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseFinancialRepository implements FinancialRepository {
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
    if (!response.ok) throw new ApiError(503, 'financial_storage_unavailable', message);
    return (await response.json()) as T[];
  }
  async ready() {
    const requiredPrimitives: Array<[string, string]> = [
      ['funding_intents', 'id'],
      // Migration-specific columns ensure readiness cannot report green before
      // the self-custody control-plane schema is actually present.
      ['treasury_destinations', 'id,controller_type,custody_model,verification_state'],
      ['deposit_routes', 'id,treasury_destination_id'],
      ['treasury_destination_challenges', 'id,request_digest'],
      ['treasury_destination_events', 'id,operation'],
      ['provider_webhook_inbox', 'id'],
      ['provider_references', 'id'],
      ['settlement_evidence', 'id,deposit_route_id,treasury_destination_id'],
      ['ledger_accounts', 'id'],
      ['ledger_journals', 'id'],
      ['ledger_postings', 'id'],
      ['reconciliation_runs', 'id'],
      ['reconciliation_items', 'id'],
      ['transfer_executions', 'id'],
      ['capital_reservations', 'id'],
    ];
    try {
      const probes = await Promise.all(
        requiredPrimitives.map(([table, columns]) =>
          this.rest(`${table}?select=${columns}&limit=1`),
        ),
      );
      return probes.every((response) => response.ok);
    } catch {
      return false;
    }
  }
  async createFundingIntent(
    input: Parameters<FinancialRepository['createFundingIntent']>[0],
  ): Promise<{ value: FundingIntentRecord; replayed: boolean }> {
    const existing = await this.rows<FundingRow>(
      `funding_intents?owner_id=eq.${encodeURIComponent(input.ownerId)}&environment=eq.${dbEnvironment(input.environment)}&idempotency_key=eq.${encodeURIComponent(input.idempotencyKey)}&select=*&limit=1`,
      'Funding storage is unavailable',
    );
    if (existing[0]) {
      if (existing[0].request_digest !== input.requestDigest)
        throw new ApiError(
          409,
          'idempotency_conflict',
          'Idempotency key was used with a different funding request',
        );
      return { value: funding(existing[0]), replayed: true };
    }
    const response = await this.rest('funding_intents', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        owner_id: input.ownerId,
        asset: input.asset,
        network: input.network ?? null,
        rail: input.rail,
        amount_atomic: input.amountAtomic ?? null,
        environment: dbEnvironment(input.environment),
        idempotency_key: input.idempotencyKey,
        request_digest: input.requestDigest,
        state: 'created',
      }),
    });
    if (response.status === 409) return this.createFundingIntent(input);
    if (!response.ok)
      throw new ApiError(
        503,
        'financial_storage_unavailable',
        'Funding intent could not be created',
      );
    return { value: funding(((await response.json()) as FundingRow[])[0]!), replayed: false };
  }
  async getFundingIntent(ownerId: string, id: string) {
    const row = (
      await this.rows<FundingRow>(
        `funding_intents?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`,
        'Funding status is unavailable',
      )
    )[0];
    if (!row) throw new ApiError(404, 'not_found', 'Funding intent not found');
    return funding(row);
  }
  async listFundingIntents(ownerId: string, limit: number) {
    return (
      await this.rows<FundingRow>(
        `funding_intents?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc&limit=${limit}`,
        'Funding activity is unavailable',
      )
    ).map(funding);
  }
  async getDepositRoute(ownerId: string, fundingIntentId: string) {
    const row = (
      await this.rows<DepositRouteRow>(
        `deposit_routes?owner_id=eq.${encodeURIComponent(ownerId)}&funding_intent_id=eq.${encodeURIComponent(fundingIntentId)}&select=*&limit=1`,
        'Deposit route is unavailable',
      )
    )[0];
    return row ? depositRoute(row) : null;
  }
  async getCanonicalBalances(ownerId: string): Promise<CanonicalBalance[]> {
    const rows = await this.rows<PostingRow>(
      `ledger_postings?select=direction,amount_atomic,asset,ledger_accounts!inner(account_code,account_class,network,owner_id)&ledger_accounts.owner_id=eq.${encodeURIComponent(ownerId)}`,
      'Canonical balances are unavailable',
    );
    const balances = new Map<string, CanonicalBalance>();
    for (const row of rows) {
      const account = row.ledger_accounts;
      if (!account || !account.account_code.startsWith('capital:')) continue;
      const key = `${row.asset}:${account.network ?? ''}`;
      const current = balances.get(key) ?? {
        asset: row.asset,
        network: account.network,
        totalAtomic: '0',
        availableAtomic: '0',
        reservedAtomic: '0',
        pendingAtomic: '0',
        restrictedAtomic: '0',
      };
      const atomicText = String(row.amount_atomic).split('.')[0] ?? '0';
      const signed = (row.direction === 'credit' ? 1n : -1n) * BigInt(atomicText);
      const field =
        account.account_code === 'capital:available'
          ? 'availableAtomic'
          : account.account_code === 'capital:reserved'
            ? 'reservedAtomic'
            : account.account_code === 'capital:pending'
              ? 'pendingAtomic'
              : account.account_code === 'capital:restricted'
                ? 'restrictedAtomic'
                : null;
      if (field) current[field] = (BigInt(current[field]) + signed).toString();
      balances.set(key, current);
    }
    for (const value of balances.values())
      value.totalAtomic = (
        BigInt(value.availableAtomic) +
        BigInt(value.reservedAtomic) +
        BigInt(value.pendingAtomic) +
        BigInt(value.restrictedAtomic)
      ).toString();
    return [...balances.values()];
  }
  async listAliases(ownerId: string) {
    return (
      await this.rows<AliasRow>(
        `transfer_aliases_v2?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc`,
        'Transfer aliases are unavailable',
      )
    ).map(alias);
  }
  async createAlias(input: Parameters<FinancialRepository['createAlias']>[0]) {
    const response = await this.rest('transfer_aliases_v2', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        owner_id: input.ownerId,
        alias: input.alias,
        destination_type: input.destinationType,
        destination_reference: input.destinationReference,
        verification_state: 'unverified',
        activation_state: 'inactive',
      }),
    });
    if (response.status === 409)
      throw new ApiError(409, 'alias_conflict', 'Transfer alias already exists');
    if (!response.ok)
      throw new ApiError(
        503,
        'financial_storage_unavailable',
        'Transfer alias could not be created',
      );
    return alias(((await response.json()) as AliasRow[])[0]!);
  }
  async createTransfer(
    input: Parameters<FinancialRepository['createTransfer']>[0],
  ): Promise<{ value: TransferExecutionRecord; replayed: boolean }> {
    const existing = await this.rows<TransferRow>(
      `transfer_executions?owner_id=eq.${encodeURIComponent(input.ownerId)}&environment=eq.${dbEnvironment(input.environment)}&idempotency_key=eq.${encodeURIComponent(input.idempotencyKey)}&select=*&limit=1`,
      'Transfer storage is unavailable',
    );
    if (existing[0]) {
      if (existing[0].request_digest !== input.requestDigest)
        throw new ApiError(
          409,
          'idempotency_conflict',
          'Idempotency key was used with a different transfer request',
        );
      return { value: transfer(existing[0]), replayed: true };
    }
    const aliases = await this.rows<AliasRow>(
      `transfer_aliases_v2?id=eq.${encodeURIComponent(input.aliasId)}&owner_id=eq.${encodeURIComponent(input.ownerId)}&select=*&limit=1`,
      'Transfer destination verification is unavailable',
    );
    const destination = aliases[0];
    if (!destination) throw new ApiError(404, 'not_found', 'Transfer alias not found');
    if (destination.verification_state !== 'verified' || destination.activation_state !== 'active')
      throw new ApiError(
        409,
        'destination_not_verified',
        'Transfer destination is not verified and active',
      );
    const response = await this.rest('transfer_executions', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        owner_id: input.ownerId,
        alias_id: input.aliasId,
        asset: input.asset,
        network: input.network ?? null,
        rail: input.rail,
        amount_atomic: input.amountAtomic,
        environment: dbEnvironment(input.environment),
        idempotency_key: input.idempotencyKey,
        request_digest: input.requestDigest,
        state: 'requested',
      }),
    });
    if (response.status === 409) return this.createTransfer(input);
    if (!response.ok)
      throw new ApiError(
        503,
        'financial_storage_unavailable',
        'Transfer request could not be created',
      );
    return { value: transfer(((await response.json()) as TransferRow[])[0]!), replayed: false };
  }
  async getTransfer(ownerId: string, id: string) {
    const row = (
      await this.rows<TransferRow>(
        `transfer_executions?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`,
        'Transfer status is unavailable',
      )
    )[0];
    if (!row) throw new ApiError(404, 'not_found', 'Transfer not found');
    return transfer(row);
  }
  async listTransfers(ownerId: string, limit: number) {
    return (
      await this.rows<TransferRow>(
        `transfer_executions?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc&limit=${limit}`,
        'Transfer activity is unavailable',
      )
    ).map(transfer);
  }
}

export function requestDigest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export class MemoryFinancialRepository implements FinancialRepository {
  readonly funding = new Map<string, FundingIntentRecord & { key: string; digest: string }>();
  readonly depositRoutes = new Map<string, DepositRouteRecord>();
  readonly aliases = new Map<string, TransferAliasRecord>();
  readonly transfers = new Map<string, TransferExecutionRecord & { key: string; digest: string }>();
  readonly balancesByOwner = new Map<string, CanonicalBalance[]>();
  async ready() {
    return true;
  }
  async createFundingIntent(input: Parameters<FinancialRepository['createFundingIntent']>[0]) {
    const previous = [...this.funding.values()].find(
      (x) =>
        x.ownerId === input.ownerId &&
        x.environment === input.environment &&
        x.key === input.idempotencyKey,
    );
    if (previous) {
      if (previous.digest !== input.requestDigest)
        throw new ApiError(409, 'idempotency_conflict', 'Idempotency conflict');
      return { value: previous, replayed: true };
    }
    const now = new Date().toISOString();
    const value = {
      id: randomUUID(),
      ownerId: input.ownerId,
      asset: input.asset,
      network: input.network ?? null,
      rail: input.rail,
      amountAtomic: input.amountAtomic ?? null,
      state: 'CREATED' as const,
      environment: input.environment,
      createdAt: now,
      updatedAt: now,
      key: input.idempotencyKey,
      digest: input.requestDigest,
    };
    this.funding.set(value.id, value);
    return { value, replayed: false };
  }
  async getFundingIntent(ownerId: string, id: string) {
    const value = this.funding.get(id);
    if (!value || value.ownerId !== ownerId)
      throw new ApiError(404, 'not_found', 'Funding intent not found');
    return value;
  }
  async listFundingIntents(ownerId: string, limit: number) {
    return [...this.funding.values()].filter((x) => x.ownerId === ownerId).slice(0, limit);
  }
  async getDepositRoute(ownerId: string, fundingIntentId: string) {
    const value = this.depositRoutes.get(fundingIntentId);
    return value && value.ownerId === ownerId ? value : null;
  }
  async getCanonicalBalances(ownerId: string) {
    return structuredClone(this.balancesByOwner.get(ownerId) ?? []);
  }
  async listAliases(ownerId: string) {
    return [...this.aliases.values()].filter((x) => x.ownerId === ownerId);
  }
  async createAlias(input: Parameters<FinancialRepository['createAlias']>[0]) {
    const now = new Date().toISOString();
    const value: TransferAliasRecord = {
      id: randomUUID(),
      ...input,
      verificationState: 'unverified',
      activationState: 'inactive',
      createdAt: now,
      updatedAt: now,
    };
    this.aliases.set(value.id, value);
    return value;
  }
  async createTransfer(input: Parameters<FinancialRepository['createTransfer']>[0]) {
    const previous = [...this.transfers.values()].find(
      (x) =>
        x.ownerId === input.ownerId &&
        x.environment === input.environment &&
        x.key === input.idempotencyKey,
    );
    if (previous) {
      if (previous.digest !== input.requestDigest)
        throw new ApiError(409, 'idempotency_conflict', 'Idempotency conflict');
      return { value: previous, replayed: true };
    }
    const a = this.aliases.get(input.aliasId);
    if (
      !a ||
      a.ownerId !== input.ownerId ||
      a.verificationState !== 'verified' ||
      a.activationState !== 'active'
    )
      throw new ApiError(
        409,
        'destination_not_verified',
        'Transfer destination is not verified and active',
      );
    const now = new Date().toISOString();
    const value = {
      id: randomUUID(),
      ownerId: input.ownerId,
      aliasId: input.aliasId,
      asset: input.asset,
      network: input.network ?? null,
      rail: input.rail,
      amountAtomic: input.amountAtomic,
      state: 'REQUESTED' as const,
      environment: input.environment,
      createdAt: now,
      updatedAt: now,
      key: input.idempotencyKey,
      digest: input.requestDigest,
    };
    this.transfers.set(value.id, value);
    return { value, replayed: false };
  }
  async getTransfer(ownerId: string, id: string) {
    const value = this.transfers.get(id);
    if (!value || value.ownerId !== ownerId)
      throw new ApiError(404, 'not_found', 'Transfer not found');
    return value;
  }
  async listTransfers(ownerId: string, limit: number) {
    return [...this.transfers.values()].filter((x) => x.ownerId === ownerId).slice(0, limit);
  }
}
