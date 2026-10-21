import { PageContext } from '@/components/page-context';
import { TreasuryPage } from '@/components/business-product-pages';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Treasury',
  description: 'See where organizational funds sit, understand operating liquidity, and keep movement, destination, policy and record context visible.',
  path: '/treasury',
});

function PageContent() {
  return <TreasuryPage />;
}

export default function Page() {
  return <><PageContent /><PageContext route="/treasury" /></>;
}
