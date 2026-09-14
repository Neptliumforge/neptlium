import { TreasuryPage } from '@/components/business-product-pages';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Treasury',
  description: 'See where organizational funds sit, understand operating liquidity, and keep movement, destination, policy and record context visible.',
  path: '/treasury',
});

export default function Page() {
  return <TreasuryPage />;
}
