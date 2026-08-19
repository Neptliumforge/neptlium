import { ApiError } from './errors.js';

type Fetch = typeof fetch;
export type TreasuryDestinationRow = Record<string, unknown>;

export interface TreasuryDestinationRepository {
  list(): Promise<TreasuryDestinationRow[]>;
  get(id: string): Promise<TreasuryDestinationRow>;
  getChallenge(id: string): Promise<TreasuryDestinationRow>;
  create(input: Record<string, unknown>): Promise<TreasuryDestinationRow>;
  issueChallenge(input: Record<string, unknown>): Promise<TreasuryDestinationRow>;
  verify(input: Record<string, unknown>): Promise<TreasuryDestinationRow>;
  recordVerificationFailure(input: Record<string, unknown>): Promise<TreasuryDestinationRow>;
  transition(input: Record<string, unknown>): Promise<TreasuryDestinationRow>;
}

export class DisabledTreasuryDestinationRepository implements TreasuryDestinationRepository {
  private unavailable(): never {
    throw new ApiError(
      503,
      'treasury_destination_storage_unavailable',
      'Treasury destination control-plane storage is unavailable',
    );
  }
  async list(): Promise<TreasuryDestinationRow[]> {
    return this.unavailable();
  }
  async get(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async getChallenge(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async create(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async issueChallenge(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async verify(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async recordVerificationFailure(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
  async transition(): Promise<TreasuryDestinationRow> {
    return this.unavailable();
  }
}

export class SupabaseTreasuryDestinationRepository implements TreasuryDestinationRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {}
  private async rest(path: string, init: RequestInit = {}) {
    return this.request(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        'content-type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(8_000),
    });
  }
  private async rows(path: string) {
    const response = await this.rest(path);
    if (!response.ok)
      throw new ApiError(
        503,
        'treasury_destination_storage_unavailable',
        'Treasury destination storage is unavailable',
      );
    return (await response.json()) as TreasuryDestinationRow[];
  }
  private async rpc(name: string, input: Record<string, unknown>) {
    const response = await this.rest(`rpc/${name}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      if (response.status === 409 || /idempotency/i.test(detail))
        throw new ApiError(
          409,
          'idempotency_conflict',
          'Idempotency key was used with a conflicting treasury request',
        );
      throw new ApiError(
        503,
        'treasury_destination_storage_unavailable',
        'Treasury destination operation could not be completed',
      );
    }
    const result = (await response.json()) as TreasuryDestinationRow | TreasuryDestinationRow[];
    return Array.isArray(result) ? result[0]! : result;
  }
  async list() {
    return this.rows('treasury_destinations?select=*&order=created_at.desc');
  }
  async get(id: string) {
    const row = (
      await this.rows(`treasury_destinations?id=eq.${encodeURIComponent(id)}&select=*&limit=1`)
    )[0];
    if (!row)
      throw new ApiError(
        404,
        'treasury_destination_not_found',
        'Treasury destination was not found',
      );
    return row;
  }
  async getChallenge(id: string) {
    const row = (
      await this.rows(
        `treasury_destination_challenges?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
      )
    )[0];
    if (!row)
      throw new ApiError(404, 'treasury_challenge_not_found', 'Ownership challenge was not found');
    return row;
  }
  async create(input: Record<string, unknown>) {
    return this.rpc('create_treasury_destination_candidate', input);
  }
  async issueChallenge(input: Record<string, unknown>) {
    return this.rpc('issue_treasury_destination_challenge', input);
  }
  async verify(input: Record<string, unknown>) {
    return this.rpc('consume_treasury_destination_challenge', input);
  }
  async recordVerificationFailure(input: Record<string, unknown>) {
    return this.rpc('record_treasury_destination_verification_failure', input);
  }
  async transition(input: Record<string, unknown>) {
    return this.rpc('transition_treasury_destination', input);
  }
}
