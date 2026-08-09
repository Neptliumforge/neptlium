import { Landmark } from 'lucide-react';
import { Card, CardContent, EmptyState, StatCard } from '@neptlium/ui';
export function TreasuryView() {
  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-lg font-semibold">Treasury</h1>
        <p className="mt-1 text-sm text-text-muted">
          Liquidity, reserves, available capital, readiness, exposure, and treasury position.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Treasury data" value="Backend required" />
        <StatCard label="Capital readiness" value="Unavailable" />
      </div>
      <Card>
        <CardContent>
          <EmptyState
            icon={<Landmark className="size-5" />}
            title="Treasury position unavailable"
            description="Connected ledger and custody data are required before reserves, exposures, or treasury position can be reported."
          />
        </CardContent>
      </Card>
    </div>
  );
}
