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
      <CardContent className="py-10">
        <EmptyState
          icon={<Wallet className="size-5" aria-hidden="true" />}
          title="Deposit unavailable"
          description="Crypto deposits and funding references require a connected custody provider. No destination is available."
        />
      </CardContent>
    </Card>
  );
}

export { DepositPanel as CryptoDepositFlow };
