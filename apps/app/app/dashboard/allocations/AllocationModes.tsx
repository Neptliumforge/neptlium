'use client';
import { useState } from 'react';
import { Eye, LockKeyhole } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  Label,
} from '@neptlium/ui';
type Mode = 'Observe' | 'Model' | 'Authorize';
export function AllocationModes() {
  const [mode, setMode] = useState<Mode>('Observe');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-lg font-semibold">Allocation</h1>
        <p className="mt-1 text-sm text-text-muted">
          Observe, model, and understand authorization readiness.
        </p>
        <p className="mt-2 font-medium text-accent-primary">Modeling does not move capital.</p>
      </header>
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Allocation modes">
        {(['Observe', 'Model', 'Authorize'] as Mode[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            className={`min-h-11 rounded-md border px-3 text-sm ${mode === item ? 'border-accent-primary text-accent-primary' : 'border-border-default text-text-secondary'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {mode === 'Observe' && (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Eye className="size-5" />}
              title="Observed allocation unavailable"
              description="Observed allocation requires connected portfolio and custody data. No connected data is available."
            />
          </CardContent>
        </Card>
      )}
      {mode === 'Model' && (
        <Card>
          <CardHeader>
            <CardTitle>Illustrative local model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-muted">
              This non-persistent demonstration stays in your browser. It does not use pricing,
              predict returns, recommend allocations, or call an execution provider.
            </p>
            <Field>
              <Label htmlFor="scenario-label">Scenario label</Label>
              <Input
                id="scenario-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Illustrative scenario"
              />
            </Field>
            <Field>
              <Label htmlFor="scenario-amount">Illustrative asset units</Label>
              <Input
                id="scenario-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="—"
              />
            </Field>
            {(label || amount) && (
              <div className="rounded-md border border-border-default p-4">
                <p className="text-xs text-text-muted">Local preview only</p>
                <p className="mt-1 text-sm">
                  {label || 'Unnamed scenario'}: {amount || '—'} unspecified asset units
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {mode === 'Authorize' && (
        <Card>
          <CardContent>
            <EmptyState
              icon={<LockKeyhole className="size-5" />}
              title="Authorization unavailable"
              description="Authorization requires real ledger, custody, security, and execution infrastructure. No allocation request can be submitted here."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
