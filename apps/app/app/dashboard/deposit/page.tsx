import { Wallet } from 'lucide-react';
import { Card, CardContent, EmptyState } from '@neptlium/ui';
import { requireProvisionedUser } from '@/lib/auth';
export default async function Page() {
  await requireProvisionedUser();
  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-lg font-semibold">Deposit</h1>
      </header>
      <Card>
        <CardContent>
          <EmptyState
            icon={<Wallet className="size-5" />}
            title="Deposit unavailable"
            description="Deposits will become available when your Capital Account is ready."
          />
        </CardContent>
      </Card>
    </div>
  );
}
