import { randomUUID } from 'node:crypto';

export type JobState = 'queued' | 'leased' | 'completed' | 'dead_letter';
export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  state: JobState;
  attempts: number;
  availableAt: number;
  leaseOwner?: string;
  leaseExpiresAt?: number;
  lastError?: string;
}
export interface JobStore {
  enqueue(
    type: string,
    payload: unknown,
    idempotencyKey: string,
    availableAt?: number,
  ): Promise<Job>;
  lease(workerId: string, leaseMs: number, now?: number): Promise<Job | undefined>;
  complete(jobId: string, workerId: string): Promise<void>;
  renew(jobId: string, workerId: string, leaseMs: number, now?: number): Promise<void>;
  retry(jobId: string, workerId: string, availableAt: number, safeError: string): Promise<void>;
  deadLetter(jobId: string, workerId: string, safeError: string): Promise<void>;
  get(jobId: string): Promise<Job | undefined>;
}

export class MemoryJobStore implements JobStore {
  readonly jobs = new Map<string, Job>();
  private readonly keys = new Map<string, string>();
  async enqueue(type: string, payload: unknown, key: string, availableAt = Date.now()) {
    const existing = this.keys.get(`${type}:${key}`);
    if (existing) return structuredClone(this.jobs.get(existing)!);
    const job: Job = {
      id: randomUUID(),
      type,
      payload: structuredClone(payload),
      state: 'queued',
      attempts: 0,
      availableAt,
    };
    this.jobs.set(job.id, job);
    this.keys.set(`${type}:${key}`, job.id);
    return structuredClone(job);
  }
  async lease(workerId: string, leaseMs: number, now = Date.now()) {
    const job = [...this.jobs.values()]
      .sort((a, b) => a.availableAt - b.availableAt)
      .find(
        (candidate) =>
          candidate.availableAt <= now &&
          (candidate.state === 'queued' ||
            (candidate.state === 'leased' && (candidate.leaseExpiresAt ?? 0) <= now)),
      );
    if (!job) return undefined;
    job.state = 'leased';
    job.leaseOwner = workerId;
    job.leaseExpiresAt = now + leaseMs;
    job.attempts += 1;
    return structuredClone(job);
  }
  async complete(id: string, owner: string) {
    const job = this.owned(id, owner);
    job.state = 'completed';
    delete job.leaseOwner;
    delete job.leaseExpiresAt;
  }
  async renew(id: string, owner: string, leaseMs: number, now = Date.now()) {
    this.owned(id, owner).leaseExpiresAt = now + leaseMs;
  }
  async retry(id: string, owner: string, availableAt: number, error: string) {
    const job = this.owned(id, owner);
    job.state = 'queued';
    job.availableAt = availableAt;
    job.lastError = error;
    delete job.leaseOwner;
    delete job.leaseExpiresAt;
  }
  async deadLetter(id: string, owner: string, error: string) {
    const job = this.owned(id, owner);
    job.state = 'dead_letter';
    job.lastError = error;
    delete job.leaseOwner;
    delete job.leaseExpiresAt;
  }
  async get(id: string) {
    const job = this.jobs.get(id);
    return job ? structuredClone(job) : undefined;
  }
  private owned(id: string, owner: string) {
    const job = this.jobs.get(id);
    if (!job || job.state !== 'leased' || job.leaseOwner !== owner)
      throw new Error('job lease ownership lost');
    return job;
  }
}

export interface JobControl {
  renew(): Promise<void>;
}
export type JobHandler = (job: Job, control: JobControl) => Promise<void>;
export class DurableWorker {
  constructor(
    private readonly store: JobStore,
    private readonly handlers: Readonly<Record<string, JobHandler>>,
    private readonly options = {
      leaseMs: 30_000,
      maxAttempts: 8,
      baseDelayMs: 1_000,
      maxDelayMs: 300_000,
    },
  ) {}
  async runOnce(workerId: string, now = Date.now()) {
    const job = await this.store.lease(workerId, this.options.leaseMs, now);
    if (!job) return false;
    const handler = this.handlers[job.type];
    if (!handler) {
      await this.store.deadLetter(job.id, workerId, 'unsupported_job_type');
      return true;
    }
    try {
      await handler(job, { renew: () => this.store.renew(job.id, workerId, this.options.leaseMs) });
      await this.store.complete(job.id, workerId);
    } catch (error) {
      const safe = error instanceof Error ? error.name : 'unknown_error';
      if (job.attempts >= this.options.maxAttempts)
        await this.store.deadLetter(job.id, workerId, safe);
      else {
        const exponential = Math.min(
          this.options.maxDelayMs,
          this.options.baseDelayMs * 2 ** (job.attempts - 1),
        );
        const jitter = Math.floor(exponential * 0.2 * ((job.id.charCodeAt(0) % 11) / 10));
        await this.store.retry(job.id, workerId, now + exponential + jitter, safe);
      }
    }
    return true;
  }
}

export const operationalJobTypes = [
  'webhook.process',
  'reconciliation.run',
  'ledger.settle',
] as const;
export async function scheduleOperationalJob(
  store: JobStore,
  type: (typeof operationalJobTypes)[number],
  payload: unknown,
  scheduleKey: string,
  availableAt = Date.now(),
) {
  return store.enqueue(type, payload, scheduleKey, availableAt);
}
