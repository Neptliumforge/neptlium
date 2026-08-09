import { AssetIdentity, Badge } from '@neptlium/ui';
import type { CustodyTransaction } from '@neptlium/lib';

const STATUS_TONE: Record<
  CustodyTransaction['status'],
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  completed: 'success',
  pending: 'warning',
  pending_review: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
};

export interface TransactionListProps {
  readonly transactions: readonly CustodyTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead className="border-b border-border-default">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Type</th>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Asset</th>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Amount</th>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Reference</th>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Status</th>
            <th className="px-4 py-2 text-left font-medium text-text-secondary">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-border-hairline">
              <td className="px-4 py-2 capitalize text-text-primary">{transaction.type}</td>
              <td className="px-4 py-2 text-text-primary">
                <AssetIdentity asset={transaction.asset} network={transaction.network} size="sm" />
              </td>
              <td className="px-4 py-2 text-text-primary">
                {transaction.type === 'withdrawal' ? '-' : ''}
                {transaction.amount.toFixed(2)}
              </td>
              <td className="px-4 py-2 font-mono text-text-secondary">
                {transaction.reference ?? transaction.counterparty ?? '—'}
              </td>
              <td className="px-4 py-2">
                <Badge tone={STATUS_TONE[transaction.status]}>{transaction.status}</Badge>
              </td>
              <td className="px-4 py-2 text-text-muted">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
