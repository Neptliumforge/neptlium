import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type { Asset, DepositState, Network, WithdrawalState } from './domain.js';
import { transition } from './domain.js';
import type { ProviderWalletLink } from './providers.js';

export interface Withdrawal {
  id: string;
  ownerId: string;
  asset: Asset;
  network: Network;
  amount: string;
  destination: string;
  state: WithdrawalState;
  createdAt: string;
}
export interface Deposit {
  id: string;
  ownerId: string;
  asset: Asset;
  network: Network;
  amount: string;
  confirmations: number;
  state: DepositState;
  createdAt: string;
}
export interface AuditEvent {
  id: string;
  actorId: string;
  operation: string;
  resourceId: string;
  oldState?: string;
  newState?: string;
  requestId: string;
  createdAt: string;
}
interface IdempotencyRecord {
  ownerId: string;
  operation: string;
  key: string;
  digest: string;
  response: unknown;
}
export interface WebhookRecord {
  provider: string;
  eventId: string;
  digest: string;
  state: string;
}
export interface IdempotentResult<T> {
  value: T;
  replayed: boolean;
}
export type WebhookInsertResult = 'inserted' | 'duplicate';

export interface ApiRepository {
  ready(): boolean | Promise<boolean>;
  provisionAccount(ownerId: string): Promise<{ profileId: string }>;
  completeOnboarding(ownerId: string, payload: unknown): Promise<{ profileId: string }>;
  getProviderWallet(
    ownerId: string,
  ): ProviderWalletLink | undefined | Promise<ProviderWalletLink | undefined>;
  linkProviderWallet(
    ownerId: string,
    link: ProviderWalletLink,
  ): ProviderWalletLink | Promise<ProviderWalletLink>;
  createWithdrawalIdempotently(input: {
    ownerId: string;
    operation: string;
    key: string;
    requestDigest: string;
    requestId: string;
    withdrawal: Omit<Withdrawal, 'id' | 'state' | 'createdAt'>;
  }): IdempotentResult<Withdrawal> | Promise<IdempotentResult<Withdrawal>>;
  getWithdrawal(ownerId: string, id: string): Withdrawal | Promise<Withdrawal>;
  cancelWithdrawalIdempotently(input: {
    ownerId: string;
    withdrawalId: string;
    key: string;
    requestId: string;
  }): IdempotentResult<Withdrawal> | Promise<IdempotentResult<Withdrawal>>;
  listDeposits(ownerId: string): Deposit[] | Promise<Deposit[]>;
  listTransactions(
    ownerId: string,
    cursor: number,
    limit: number,
  ): Withdrawal[] | Promise<Withdrawal[]>;
  audit(input: Omit<AuditEvent, 'id' | 'createdAt'>): void | Promise<void>;
  recordWebhook(
    record: WebhookRecord,
    requestId: string,
  ): WebhookInsertResult | Promise<WebhookInsertResult>;
}

export class MemoryRepository implements ApiRepository {
  readonly withdrawals = new Map<string, Withdrawal>();
  readonly deposits = new Map<string, Deposit>();
  readonly audits: AuditEvent[] = [];
  readonly idempotency = new Map<string, IdempotencyRecord>();
  readonly webhooks = new Map<string, WebhookRecord>();
  readonly providerWallets = new Map<string, ProviderWalletLink>();

  ready() {
    return true;
  }
  async provisionAccount(ownerId: string) {
    return { profileId: ownerId };
  }
  async completeOnboarding(ownerId: string) {
    return { profileId: ownerId };
  }
  getProviderWallet(ownerId: string) {
    const value = this.providerWallets.get(ownerId);
    return value ? structuredClone(value) : undefined;
  }
  linkProviderWallet(ownerId: string, link: ProviderWalletLink) {
    const existing = this.providerWallets.get(ownerId);
    if (existing && existing.providerWalletId !== link.providerWalletId)
      throw new ApiError(
        409,
        'provider_wallet_conflict',
        'Capital Account already has a provider wallet',
      );
    this.providerWallets.set(ownerId, structuredClone(link));
    return structuredClone(link);
  }

  createWithdrawalIdempotently(input: {
    ownerId: string;
    operation: string;
    key: string;
    requestDigest: string;
    requestId: string;
    withdrawal: Omit<Withdrawal, 'id' | 'state' | 'createdAt'>;
  }): IdempotentResult<Withdrawal> {
    const scope = `${input.ownerId}:${input.operation}:${input.key}`;
    const previous = this.idempotency.get(scope);
    if (previous) {
      if (previous.digest !== input.requestDigest)
        throw new ApiError(
          409,
          'idempotency_conflict',
          'Idempotency key was used with a different request',
        );
      return { value: structuredClone(previous.response as Withdrawal), replayed: true };
    }
    const record: Withdrawal = {
      ...input.withdrawal,
      id: randomUUID(),
      state: 'requested',
      createdAt: new Date().toISOString(),
    };
    this.withdrawals.set(record.id, record);
    this.idempotency.set(scope, {
      ownerId: input.ownerId,
      operation: input.operation,
      key: input.key,
      digest: input.requestDigest,
      response: structuredClone(record),
    });
    this.audit({
      actorId: input.ownerId,
      operation: 'withdrawal.created',
      resourceId: record.id,
      newState: record.state,
      requestId: input.requestId,
    });
    return { value: structuredClone(record), replayed: false };
  }
  getWithdrawal(ownerId: string, id: string) {
    const result = this.withdrawals.get(id);
    if (!result || result.ownerId !== ownerId)
      throw new ApiError(404, 'not_found', 'Withdrawal not found');
    return structuredClone(result);
  }
  cancelWithdrawalIdempotently(input: {
    ownerId: string;
    withdrawalId: string;
    key: string;
    requestId: string;
  }): IdempotentResult<Withdrawal> {
    const scope = `${input.ownerId}:cancel_withdrawal:${input.key}`;
    const requestDigest = input.withdrawalId;
    const previous = this.idempotency.get(scope);
    if (previous) {
      if (previous.digest !== requestDigest)
        throw new ApiError(
          409,
          'idempotency_conflict',
          'Idempotency key was used with a different withdrawal',
        );
      return { value: structuredClone(previous.response as Withdrawal), replayed: true };
    }
    const record = this.withdrawals.get(input.withdrawalId);
    if (!record || record.ownerId !== input.ownerId)
      throw new ApiError(404, 'not_found', 'Withdrawal not found');
    const oldState = record.state;
    if (oldState !== 'cancelled') record.state = transition('withdrawal', oldState, 'cancelled');
    const response = structuredClone(record);
    this.idempotency.set(scope, {
      ownerId: input.ownerId,
      operation: 'cancel_withdrawal',
      key: input.key,
      digest: requestDigest,
      response,
    });
    if (oldState !== 'cancelled')
      this.audit({
        actorId: input.ownerId,
        operation: 'withdrawal.cancelled',
        resourceId: record.id,
        oldState,
        newState: record.state,
        requestId: input.requestId,
      });
    return { value: structuredClone(response), replayed: false };
  }
  listDeposits(ownerId: string) {
    return [...this.deposits.values()].filter((deposit) => deposit.ownerId === ownerId);
  }
  listTransactions(ownerId: string, cursor: number, limit: number) {
    return [...this.withdrawals.values()]
      .filter((withdrawal) => withdrawal.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(cursor, cursor + limit)
      .map((withdrawal) => structuredClone(withdrawal));
  }
  audit(input: Omit<AuditEvent, 'id' | 'createdAt'>) {
    this.audits.push({ ...input, id: randomUUID(), createdAt: new Date().toISOString() });
  }
  recordWebhook(record: WebhookRecord, requestId: string): WebhookInsertResult {
    const scope = `${record.provider}:${record.eventId}`;
    const previous = this.webhooks.get(scope);
    if (previous) {
      if (previous.digest !== record.digest)
        throw new ApiError(409, 'webhook_replay_detected', 'Event ID payload mismatch');
      return 'duplicate';
    }
    this.webhooks.set(scope, record);
    this.audit({
      actorId: 'system',
      operation: 'webhook.verified',
      resourceId: record.eventId,
      newState: record.state,
      requestId,
    });
    return 'inserted';
  }
}
