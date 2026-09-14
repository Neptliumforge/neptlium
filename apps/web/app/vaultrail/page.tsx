import { VaultRailPage } from '@/components/business-product-pages';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'VaultRail',
  description: 'Run business financial operations with treasury, payments, approvals, policy, counterparty and audit context in one Neptlium environment.',
  path: '/vaultrail',
});

export default function Page() {
  return <VaultRailPage />;
}
