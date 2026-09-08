import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type { RevealedThesisObservation } from './thesis-revealed.js';

type Fetch = typeof fetch;
export interface RevealedObservationSnapshot { readonly id: string; readonly ownerId: string; readonly thesisId: string; readonly thesisVersion: number; readonly observation: RevealedThesisObservation; readonly computedAt: string }
export interface RevealedThesisRepository {
  saveSnapshot(input: { ownerId: string; thesisId: string; thesisVersion: number; observations: readonly RevealedThesisObservation[]; computedAt: string }): Promise<RevealedObservationSnapshot[]>;
  listLatest(ownerId: string, thesisId: string, thesisVersion: number): Promise<RevealedObservationSnapshot[]>;
  get(ownerId: string, thesisId: string, observationId: string): Promise<RevealedObservationSnapshot | null>;
}
type Row = { id: string; owner_id: string; thesis_id: string; thesis_version: number; observation: RevealedThesisObservation; computed_at: string; computation_id: string };
const map = (row: Row): RevealedObservationSnapshot => ({ id: row.id, ownerId: row.owner_id, thesisId: row.thesis_id, thesisVersion: Number(row.thesis_version), observation: row.observation, computedAt: row.computed_at });

export class SupabaseRevealedThesisRepository implements RevealedThesisRepository {
  constructor(private readonly url: string, private readonly serviceRoleKey: string, private readonly request: Fetch = fetch) {}
  private headers(extra: HeadersInit = {}): HeadersInit { return { authorization: `Bearer ${this.serviceRoleKey}`, apikey: this.serviceRoleKey, 'content-type': 'application/json', ...extra }; }
  private async rest(path: string, init: RequestInit = {}) { return this.request(`${this.url}/rest/v1/${path}`, { ...init, headers: this.headers(init.headers), signal: AbortSignal.timeout(8_000) }); }
  async saveSnapshot(input: { ownerId: string; thesisId: string; thesisVersion: number; observations: readonly RevealedThesisObservation[]; computedAt: string }) {
    if (!input.observations.length) return [];
    const computationId = randomUUID();
    const response = await this.rest('thesis_revealed_observations?select=*', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(input.observations.map((observation) => ({ owner_id: input.ownerId, thesis_id: input.thesisId, thesis_version: input.thesisVersion, computation_id: computationId, metric_key: observation.metricKey, observation_type: observation.observationType, confidence_bps: observation.confidenceBps, strength_bps: observation.strengthBps, observation, computed_at: input.computedAt }))) });
    if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Revealed Thesis observations could not be persisted');
    return (await response.json() as Row[]).map(map);
  }
  async listLatest(ownerId: string, thesisId: string, thesisVersion: number) {
    const response = await this.rest(`thesis_revealed_observations?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(thesisId)}&thesis_version=eq.${thesisVersion}&select=*&order=computed_at.desc,id.asc&limit=1000`);
    if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Revealed Thesis observations are unavailable');
    const rows = await response.json() as Row[]; const latest = rows[0]?.computed_at;
    return rows.filter((row) => row.computed_at === latest).map(map);
  }
  async get(ownerId: string, thesisId: string, observationId: string) {
    const response = await this.rest(`thesis_revealed_observations?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(thesisId)}&observation->>id=eq.${encodeURIComponent(observationId)}&select=*&order=computed_at.desc&limit=1`);
    if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Revealed Thesis observation is unavailable');
    const row = (await response.json() as Row[])[0]; return row ? map(row) : null;
  }
}

export class MemoryRevealedThesisRepository implements RevealedThesisRepository {
  readonly snapshots: RevealedObservationSnapshot[] = [];
  async saveSnapshot(input: { ownerId: string; thesisId: string; thesisVersion: number; observations: readonly RevealedThesisObservation[]; computedAt: string }) { const rows = input.observations.map((observation) => ({ id: randomUUID(), ownerId: input.ownerId, thesisId: input.thesisId, thesisVersion: input.thesisVersion, observation: structuredClone(observation), computedAt: input.computedAt })); this.snapshots.unshift(...rows); return structuredClone(rows); }
  async listLatest(ownerId: string, thesisId: string, thesisVersion: number) { const rows = this.snapshots.filter((x) => x.ownerId === ownerId && x.thesisId === thesisId && x.thesisVersion === thesisVersion); const latest = rows.map((x) => x.computedAt).sort().at(-1); return structuredClone(rows.filter((x) => x.computedAt === latest)); }
  async get(ownerId: string, thesisId: string, observationId: string) { return structuredClone(this.snapshots.find((x) => x.ownerId === ownerId && x.thesisId === thesisId && x.observation.id === observationId) ?? null); }
}
