import { notFound, redirect } from 'next/navigation';
import { ApiClientError } from '@/lib/api/client';
import { getInvestProduct } from '@/lib/api/invest';
import { InvestProductDetailView } from '@/components/invest/InvestProductDetail';
import { InvestHeader, InvestUnavailable } from '@/components/invest/InvestCatalogView';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export default async function InvestProductPage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 64) notFound();

  try {
    const product = await getInvestProduct(slug);
    return <InvestProductDetailView product={product} />;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    if (error instanceof ApiClientError && error.status === 401)
      redirect(`/auth/sign-in?next=${encodeURIComponent(`/dashboard/invest/${slug}`)}`);
    return (
      <div className="op-stack invest-detail">
        <InvestHeader />
        <InvestUnavailable retryHref={`/dashboard/invest/${slug}`} />
      </div>
    );
  }
}
