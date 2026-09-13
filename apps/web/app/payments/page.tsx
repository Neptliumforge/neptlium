import { PaymentsPage } from '@/components/business-product-pages';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Payments',
  description: 'Create governed payment intent with counterparty, policy, approval, authorization, progression and record context kept distinct.',
  path: '/payments',
});

export default function Page() {
  return <PaymentsPage />;
}
