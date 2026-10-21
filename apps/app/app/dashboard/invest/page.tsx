import { redirect } from 'next/navigation';
import { ApiClientError } from '@/lib/api/client';
import { getInvestCatalog, getInvestSectors } from '@/lib/api/invest';
import {
  InvestCatalogView,
  InvestHeader,
  InvestStatusNote,
  InvestUnavailable,
  type CatalogFilters,
} from '@/components/invest/InvestCatalogView';
import { InvestExperience } from '@/components/product/OperatingExperience';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

export default async function InvestPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    q: first(params.q).slice(0, 80),
    family: first(params.family),
    availability: first(params.availability),
    sector: first(params.sector),
    sort: first(params.sort),
  };

  try {
    const [listing, sectors] = await Promise.all([getInvestCatalog(filters), getInvestSectors()]);
    return (
      <InvestExperience>
        <InvestCatalogView listing={listing} sectors={sectors.sectors} filters={filters} />
      </InvestExperience>
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401)
      redirect('/auth/sign-in?next=%2Fdashboard%2Finvest');
    // An unrecognised filter value is dropped rather than shown as an error.
    if (error instanceof ApiClientError && error.status === 422) redirect('/dashboard/invest');
    return (
      <InvestExperience>
        <div className="op-stack invest-catalog">
          <InvestHeader />
          <InvestStatusNote />
          <InvestUnavailable retryHref="/dashboard/invest" />
        </div>
      </InvestExperience>
    );
  }
}
