import { requireProvisionedUser } from '@/lib/auth';
import { getPortfolioState } from '@/lib/api/client';
import { getAllocationWorkspace } from '@/lib/api/allocation';
import { getCanonicalBalances } from '@/lib/api/financial';
import {
  AllocationRelationship,
  AttentionState,
  ExposurePanel,
  HoldingsTable,
  PortfolioContext,
  PortfolioState,
  type IntelligenceItem,
  type PortfolioAttentionItem,
  type PortfolioContextItem,
  type PortfolioStateItem,
} from '@/components/product/PortfolioIntelligence';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

export default async function PortfolioPage() {
  await requireProvisionedUser();

  const [portfolioResult, balancesResult, allocationResult] = await Promise.allSettled([
    getPortfolioState(),
    getCanonicalBalances(),
    getAllocationWorkspace(),
  ]);

  const portfolio = portfolioResult.status === 'fulfilled' ? portfolioResult.value : null;
  const balances = balancesResult.status === 'fulfilled' ? balancesResult.value.balances : [];
  const allocation = allocationResult.status === 'fulfilled' ? allocationResult.value : null;
  const balanceError = balancesResult.status === 'rejected';
  const allocationError = allocationResult.status === 'rejected';
  const allocationPolicy = allocation?.activePolicy ?? null;
  const allocationDrift = allocation?.drift ?? null;
  const allocationOutsidePolicy =
    allocationDrift?.rows.filter((row) => row.status === 'OUTSIDE_POLICY').length ?? 0;
  const allocationReview =
    allocationDrift?.rows.filter((row) => row.status === 'REVIEW').length ?? 0;
  const allocationValuationUnavailable =
    allocationDrift?.rows.some((row) => row.status === 'VALUATION_UNAVAILABLE') ?? false;

  const portfolioState: readonly PortfolioStateItem[] = [
    balanceError
      ? {
          label: 'Position status',
          value: 'Not loaded',
          detail: 'The Neptlium API did not return canonical positions.',
          state: 'ERROR',
        }
      : balances.length === 0
        ? {
            label: 'Position status',
            value: 'Not established',
            detail: 'No canonical portfolio positions are recorded.',
            state: 'NO_POSITION',
          }
        : {
            label: 'Position status',
            value: 'Observed',
            detail: `${balances.length} source-backed position${balances.length === 1 ? '' : 's'} recorded.`,
            state: 'AVAILABLE',
          },
    {
      label: 'Data freshness',
      value: 'Not reported',
      detail: 'The canonical balance response does not include a position observation time.',
      state: 'NO_ACTIVITY',
    },
    portfolioResult.status === 'rejected'
      ? {
          label: 'Availability',
          value: 'Not loaded',
          detail: 'The Neptlium API did not return portfolio reporting context.',
          state: 'ERROR',
        }
      : portfolio?.positions.state === 'PENDING'
        ? {
            label: 'Availability',
            value: 'Awaiting source',
            detail: portfolio.positions.reason,
            state: 'PENDING',
          }
        : {
            label: 'Availability',
            value: balanceError ? 'Not loaded' : 'Available',
            detail: balanceError
              ? 'The Neptlium API did not return position evidence.'
              : 'The canonical holdings source responded.',
            state: balanceError ? 'ERROR' : 'AVAILABLE',
          },
  ];

  const concentration: IntelligenceItem = balanceError
    ? {
        label: 'Concentration',
        value: 'Not loaded',
        detail: 'Exposure context cannot be established because canonical positions were not returned.',
        state: 'ERROR',
      }
    : balances.length === 0
      ? {
          label: 'Concentration',
          value: 'Not established',
          detail: 'Exposure analysis requires canonical portfolio positions.',
          state: 'NO_POSITION',
        }
      : balances.length === 1
        ? {
            label: 'Concentration',
            value: 'Observed',
            detail:
              'A single canonical asset position is represented. No valuation-based percentage is inferred.',
            state: 'AVAILABLE',
          }
        : {
            label: 'Concentration',
            value: portfolio?.value.state === 'UNAVAILABLE' ? 'Unavailable' : 'Not reported',
            detail: portfolio?.value.state === 'UNAVAILABLE'
              ? portfolio.value.reason
              : 'The portfolio API did not return authoritative valuation evidence.',
            state: portfolio?.value.state === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'NO_ACTIVITY',
          };

  const allocationContext: IntelligenceItem = allocationError
    ? {
        label: 'Allocation context',
        value: 'Not loaded',
        detail: 'The Neptlium API did not return governed allocation state.',
        state: 'ERROR',
      }
    : !allocationPolicy
      ? {
          label: 'Allocation context',
          value: 'Not configured',
          detail: 'No authoritative allocation policy is established.',
          state: 'NOT_CONFIGURED',
        }
      : !allocationDrift
        ? {
            label: 'Allocation context',
            value: 'Configured',
            detail: 'An authoritative allocation policy exists; drift context is not established.',
            state: 'READY',
          }
        : allocationValuationUnavailable
          ? {
              label: 'Allocation context',
              value: 'Partially available',
              detail:
                'Policy context is available, but cross-asset valuation evidence is unavailable.',
              state: 'UNAVAILABLE',
            }
          : allocationOutsidePolicy > 0 || allocationReview > 0
            ? {
                label: 'Allocation context',
                value: 'Review required',
                detail: `${allocationOutsidePolicy + allocationReview} policy relationship${allocationOutsidePolicy + allocationReview === 1 ? '' : 's'} require review.`,
                state: 'REQUIRES_APPROVAL',
              }
            : {
                label: 'Allocation context',
                value: 'Observed',
                detail: 'Current computable policy relationships are within tolerance.',
                state: 'AVAILABLE',
              };

  const policyAssets = allocationPolicy
    ? new Set(
        allocationPolicy.targets.flatMap((target) =>
          target.asset ? [`${target.asset}:${target.network ?? ''}`] : [],
        ),
      )
    : null;
  const relatedPositions = policyAssets
    ? balances.filter((balance) => policyAssets.has(`${balance.asset}:${balance.network ?? ''}`))
        .length
    : 0;
  const relationships: IntelligenceItem =
    balanceError || allocationError
      ? {
          label: 'Relationships',
          value: 'Not loaded',
          detail: 'The Neptlium API must return position and allocation evidence before relationships can be established.',
          state: 'ERROR',
        }
      : !allocationPolicy
        ? {
            label: 'Relationships',
            value: 'Not established',
            detail: 'Portfolio-to-policy relationships require an authoritative allocation policy.',
            state: 'NOT_CONFIGURED',
          }
        : {
            label: 'Relationships',
            value: 'Observed',
            detail: `${relatedPositions} of ${balances.length} canonical position${balances.length === 1 ? '' : 's'} directly correspond to asset-based policy targets.`,
            state: 'AVAILABLE',
          };

  const attention: PortfolioAttentionItem[] = [
    ...(balanceError
      ? [
          {
            id: 'positions-not-loaded',
            title: 'Position source was not loaded',
            detail: 'The Neptlium API did not return canonical holdings. No position state is inferred.',
          },
        ]
      : []),
    ...(allocationError
      ? [
          {
            id: 'allocation-not-loaded',
            title: 'Allocation context was not loaded',
            detail: 'The Neptlium API did not return authoritative policy relationships.',
          },
        ]
      : []),
    ...(allocationDrift?.rows
      .filter((row) => row.status === 'OUTSIDE_POLICY')
      .map((row) => ({
        id: `outside-policy:${row.key}`,
        title: 'Allocation relationship outside policy',
        detail: 'A governed allocation drift row is outside its configured tolerance.',
        href: '/dashboard/allocations',
      })) ?? []),
    ...(allocationDrift?.rows
      .filter((row) => row.status === 'REVIEW')
      .map((row) => ({
        id: `allocation-review:${row.key}`,
        title: 'Allocation relationship requires review',
        detail: 'A governed allocation drift row is marked for review.',
        href: '/dashboard/allocations',
      })) ?? []),
  ];

  const context: PortfolioContextItem[] = [
    balanceError
      ? {
          id: 'position-source',
          title: 'Position source was not loaded',
          detail: 'The canonical holdings collection could not be retrieved.',
        }
      : balances.length === 0
        ? {
            id: 'position-source',
            title: 'No portfolio positions available',
            detail: 'The returned canonical holdings collection is empty.',
          }
        : {
            id: 'position-source',
            title: 'Portfolio information available',
            detail: `${balances.length} canonical position record${balances.length === 1 ? '' : 's'} returned by the governed source.`,
          },
    allocationError
      ? {
          id: 'allocation-source',
          title: 'Allocation context was not loaded',
          detail: 'No policy or drift relationship is inferred.',
        }
      : {
          id: 'allocation-source',
          title: 'Allocation observation recorded',
          detail: allocationPolicy
            ? 'Authoritative policy context is connected to this portfolio view.'
            : 'No active allocation policy is recorded.',
          ...(allocation?.observed.asOf ? { occurredAt: allocation.observed.asOf } : {}),
        },
    ['UNAVAILABLE', 'NO_POSITION', 'NO_ACTIVITY', 'ERROR'].includes(concentration.state)
      ? {
          id: 'exposure-context',
          title:
            concentration.state === 'UNAVAILABLE'
              ? 'Exposure analysis unavailable'
              : concentration.state === 'ERROR'
                ? 'Exposure context was not loaded'
                : 'Exposure analysis not established',
          detail: concentration.detail,
        }
      : {
          id: 'exposure-context',
          title: 'Exposure structure observed',
          detail: concentration.detail,
        },
  ];

  return (
    <div className="space-y-10 lg:space-y-12">
      <WorkspaceHeader
        eyebrow="Portfolio"
        title="Portfolio Intelligence"
        description="Understand holdings, exposure, relationships, and strategic position."
      />

      <PortfolioState items={portfolioState} />
      <HoldingsTable balances={balances} loadError={balanceError} />
      <ExposurePanel items={[concentration]} />
      <AllocationRelationship items={[allocationContext, relationships]} />
      <AttentionState items={attention} />
      <PortfolioContext items={context} />
    </div>
  );
}
