'use client';

import { Wallet } from 'lucide-react';
import { Card, CardContent, EmptyState } from '@neptlium/ui';

export interface DepositAddress {
  id: string;
  asset: string;
  network: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface DepositPanelProps {
  existingAddresses: DepositAddress[];
  walletId: string | null;
}

export function DepositPanel(_props: DepositPanelProps) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={<Wallet className="size-5" aria-hidden="true" />}
          title="Deposit unavailable"
          description="Deposits and funding references will become available when your Capital Account is ready."
        />
      </CardContent>
    </Card>
  );
}

export { DepositPanel as CryptoDepositFlow };
