export interface LogRecord {
  level: 'info' | 'warn' | 'error';
  operation: string;
  requestId?: string;
  durationMs?: number;
  outcome?: string;
  errorCode?: string;
}

export interface LifecycleRecord {
  event: 'observation.started' | 'observation.completed' | 'observation.failed' | 'reconciliation.observed' | 'provider.event.observed' | 'webhook.lifecycle.observed';
  entityType: string;
  entityId?: string;
  lifecycleState?: string;
  timestamp: string;
  correlationId: string;
  source: string;
}

export interface Observer {
  log(record: LogRecord): void;
  increment(name: string, labels?: Readonly<Record<string, string>>): void;
  timing(name: string, milliseconds: number, labels?: Readonly<Record<string, string>>): void;
  lifecycle?(record: LifecycleRecord): void;
}

export class MemoryObserver implements Observer {
  readonly logs: LogRecord[] = [];
  readonly lifecycleEvents: LifecycleRecord[] = [];
  readonly counters = new Map<string, number>();
  readonly timings = new Map<string, number[]>();
  log(record: LogRecord) {
    this.logs.push({ ...record });
  }
  lifecycle(record: LifecycleRecord) {
    this.lifecycleEvents.push({ ...record });
  }
  increment(name: string, labels: Readonly<Record<string, string>> = {}) {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
  }
  timing(name: string, value: number) {
    const values = this.timings.get(name) ?? [];
    values.push(value);
    this.timings.set(name, values);
  }
}

export class JsonObserver implements Observer {
  log(record: LogRecord) {
    process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), ...record })}\n`);
  }
  lifecycle(record: LifecycleRecord) {
    process.stdout.write(`${JSON.stringify(record)}\n`);
  }
  increment() {}
  timing() {}
}
