'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Stack } from '@neptlium/ui';
import { ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';
import {
  AllocationContext,
  AllocationHeader,
  AllocationLifecycle,
  DecisionIntelligence,
  ModeledReview,
  ObservedCapital,
  PolicyFramework,
  type AllocationLifecycleItem,
} from '@/components/product/AllocationIntelligence';
import type {
  AllocationClassification,
  AllocationPolicyInput,
  AllocationWorkspace as Workspace,
} from '@/lib/api/allocation';
import {
  authorizeAllocationPlanAction,
  authorizeAllocationPolicyAction,
  leaveAllocationUnchangedAction,
  reviewRebalanceAction,
  saveAllocationPolicyAction,
} from './actions';

const classificationLabels: Record<AllocationClassification, string> = {
  RESERVE: 'Reserve',
  CORE: 'Core',
  GROWTH: 'Growth',
  OPPORTUNITY: 'Opportunity',
  RESTRICTED: 'Restricted',
};
const editableClassifications = ['RESERVE', 'CORE', 'GROWTH', 'OPPORTUNITY'] as const;
const driftLabels = {
  WITHIN_POLICY: 'Within policy',
  REVIEW: 'Review',
  OUTSIDE_POLICY: 'Outside policy',
  RESTRICTED: 'Restricted',
  VALUATION_UNAVAILABLE: 'Valuation unavailable',
} as const;

function lifecycleState(
  workspace: Workspace,
  key: 'Observed' | 'Modeled' | 'Authorized' | 'Executed' | 'Reconciled',
) {
  if (key === 'Observed')
    return workspace.observed.positions.length ? ('AVAILABLE' as const) : ('NO_ACTIVITY' as const);
  if (key === 'Modeled')
    return workspace.plans.length ? ('AVAILABLE' as const) : ('NO_ACTIVITY' as const);
  if (key === 'Authorized')
    return workspace.plans.some((plan) =>
      [
        'AUTHORIZED',
        'EXECUTION_PENDING',
        'EXECUTING',
        'EXECUTED',
        'PARTIALLY_EXECUTED',
        'RECONCILING',
        'RECONCILED',
      ].includes(plan.state),
    )
      ? ('AVAILABLE' as const)
      : ('NO_ACTIVITY' as const);
  if (key === 'Executed')
    return workspace.plans.some((plan) =>
      ['EXECUTED', 'PARTIALLY_EXECUTED', 'RECONCILING', 'RECONCILED'].includes(plan.state),
    )
      ? ('AVAILABLE' as const)
      : ('UNAVAILABLE' as const);
  return workspace.plans.some((plan) => plan.state === 'RECONCILED')
    ? ('AVAILABLE' as const)
    : ('UNAVAILABLE' as const);
}

function percent(bps: number) {
  return (bps / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function AllocationWorkspace({ workspace }: { readonly workspace: Workspace }) {
  const router = useRouter();
  const policy = workspace.activePolicy;
  const latestPlan = workspace.plans[0] ?? null;
  const observedAssets = useMemo(
    () =>
      workspace.observed.positions.map((position) => ({
        asset: position.asset,
        network: position.network ?? 'DENOMINATION',
      })),
    [workspace.observed.positions],
  );
  const classificationTargets = useMemo(
    () =>
      new Map(
        (policy?.targets ?? [])
          .filter((target) => target.basis === 'CLASSIFICATION')
          .map((target) => [target.classification, target.targetBps]),
      ),
    [policy],
  );
  const [draft, setDraft] = useState({
    name: policy?.name ?? '',
    objective: policy?.objective ?? '',
    reviewFrequency: policy?.reviewFrequency ?? 'MANUAL',
    reserveRequirement: percent(policy?.reserveRequirementBps ?? 0),
    driftTolerance: percent(policy?.driftToleranceBps ?? 0),
    targets: Object.fromEntries(
      editableClassifications.map((classification) => [
        classification,
        percent(classificationTargets.get(classification) ?? 0),
      ]),
    ) as Record<(typeof editableClassifications)[number], string>,
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lifecycle: readonly AllocationLifecycleItem[] = [
    {
      label: 'Observed',
      detail: 'Capital information recognized',
      state: lifecycleState(workspace, 'Observed'),
      status: workspace.observed.positions.length ? 'Available' : 'Not established',
    },
    {
      label: 'Modeled',
      detail: 'Policy scenarios prepared',
      state: lifecycleState(workspace, 'Modeled'),
      status: workspace.plans.length ? 'Available' : 'Not established',
    },
    {
      label: 'Authorized',
      detail: 'Decision approved',
      state: lifecycleState(workspace, 'Authorized'),
      status: workspace.plans.some((plan) =>
        [
          'AUTHORIZED',
          'EXECUTION_PENDING',
          'EXECUTING',
          'EXECUTED',
          'PARTIALLY_EXECUTED',
          'RECONCILING',
          'RECONCILED',
        ].includes(plan.state),
      )
        ? 'Available'
        : 'Not established',
    },
    {
      label: 'Executed',
      detail: 'Capital action completed',
      state: lifecycleState(workspace, 'Executed'),
      status: workspace.capabilities.executionState === 'UNAVAILABLE' ? 'Unavailable' : 'Not established',
    },
    {
      label: 'Reconciled',
      detail: 'Outcome verified',
      state: lifecycleState(workspace, 'Reconciled'),
      status: workspace.capabilities.canReconcile ? 'Not established' : 'Unavailable',
    },
  ];

  function run(task: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setResult(null);
    setError(null);
    startTransition(async () => {
      const response = await task();
      if (response.ok) {
        setResult(response.message ?? 'Saved.');
        router.refresh();
      } else setError(response.error ?? 'Allocation request failed.');
    });
  }

  function savePolicy() {
    const toBps = (value: string) => Math.round(Number(value || 0) * 100);
    const input: AllocationPolicyInput = {
      name: draft.name,
      objective: draft.objective,
      reviewFrequency: draft.reviewFrequency as AllocationPolicyInput['reviewFrequency'],
      reserveRequirementBps: toBps(draft.reserveRequirement),
      driftToleranceBps: toBps(draft.driftTolerance),
      allowedAssets: observedAssets,
      restrictedAssets: policy?.restrictedAssets ?? [],
      liquidityConstraints: policy?.liquidityConstraints ?? {},
      targets: editableClassifications.map((classification) => ({
        key: `classification:${classification}`,
        basis: 'CLASSIFICATION' as const,
        classification,
        targetBps: toBps(draft.targets[classification]),
        minimumBps: 0,
        maximumBps: 10_000,
      })),
    };
    run(() =>
      saveAllocationPolicyAction({
        ...(policy ? { policyId: policy.id, expectedVersion: policy.version } : {}),
        policy: input,
      }),
    );
  }

  return (
    <Stack>
      <AllocationHeader observedAt={workspace.observed.asOf} />
      <AllocationLifecycle items={lifecycle} />
      <ObservedCapital
        positions={workspace.observed.positions}
        drift={workspace.drift?.rows ?? null}
        hasPolicy={Boolean(policy)}
      />

      <PolicyFramework>
        <div className="border-y border-border-hairline py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {policy ? `${policy.name} · v${policy.version}` : 'Policy has not been established'}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Policy drafts describe intended structure. Authorization is a separate decision.
              </p>
            </div>
            {policy ? (
              <ProductStateBadge state={policy.status === 'AUTHORIZED' ? 'AVAILABLE' : 'PENDING'}>
                {policy.status === 'AUTHORIZED' ? 'Authorized' : 'Draft'}
              </ProductStateBadge>
            ) : (
              <ProductStateBadge state="NOT_CONFIGURED">Not established</ProductStateBadge>
            )}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="allocation-policy-name">Policy identity</Label>
              <Input
                id="allocation-policy-name"
                className="mt-2"
                value={draft.name}
                onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}
                placeholder="Capital policy name"
              />
            </div>
            <div>
              <Label htmlFor="allocation-objective">Objective</Label>
              <Input
                id="allocation-objective"
                className="mt-2"
                value={draft.objective}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, objective: event.target.value }))
                }
                placeholder="State the governing objective"
              />
            </div>
            <div>
              <Label htmlFor="allocation-review">Review schedule</Label>
              <select
                id="allocation-review"
                className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary"
                value={draft.reviewFrequency}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    reviewFrequency: event.target.value as AllocationPolicyInput['reviewFrequency'],
                  }))
                }
              >
                <option value="MANUAL">Manual</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="allocation-reserve">Reserve requirement %</Label>
                <Input
                  id="allocation-reserve"
                  inputMode="decimal"
                  className="mt-2"
                  value={draft.reserveRequirement}
                  onChange={(event) =>
                    setDraft((value) => ({ ...value, reserveRequirement: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="allocation-drift">Drift tolerance %</Label>
                <Input
                  id="allocation-drift"
                  inputMode="decimal"
                  className="mt-2"
                  value={draft.driftTolerance}
                  onChange={(event) =>
                    setDraft((value) => ({ ...value, driftTolerance: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-border-hairline pt-4">
            <div className="hidden grid-cols-[1fr_8rem] gap-4 pb-2 text-xs text-text-muted sm:grid">
              <span>Capital targets</span>
              <span>Target</span>
            </div>
            {editableClassifications.map((classification) => (
              <div
                key={classification}
                className="grid grid-cols-[1fr_7rem] items-center gap-4 border-t border-border-hairline py-3 first:border-t-0"
              >
                <span className="text-sm text-text-primary">
                  {classificationLabels[classification]}
                </span>
                <div>
                  <Label htmlFor={`target-${classification}`} className="sr-only">
                    {classificationLabels[classification]} target percent
                  </Label>
                  <Input
                    id={`target-${classification}`}
                    inputMode="decimal"
                    value={draft.targets[classification]}
                    onChange={(event) =>
                      setDraft((value) => ({
                        ...value,
                        targets: { ...value.targets, [classification]: event.target.value },
                      }))
                    }
                    aria-label={`${classificationLabels[classification]} target percent`}
                  />
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs text-text-muted">
              Targets must total 100%. Restricted capital remains outside editable allocation
              targets.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={savePolicy} disabled={pending}>
              Save draft
            </Button>
            {policy?.status === 'DRAFT' ? (
              <Button
                variant="secondary"
                onClick={() =>
                  run(() => authorizeAllocationPolicyAction(policy.id, policy.version))
                }
                disabled={pending}
              >
                Authorize policy
              </Button>
            ) : null}
          </div>
        </div>
      </PolicyFramework>

      <DecisionIntelligence
        policyStatus={
          policy
            ? policy.status === 'AUTHORIZED'
              ? 'Aligned to authorized policy'
              : 'Draft policy'
            : 'Awaiting policy'
        }
        driftStatus={!policy ? 'Awaiting policy' : workspace.drift ? 'Available' : 'Not established'}
        reviewStatus={
          workspace.drift?.rows.some(
            (row) => row.status === 'REVIEW' || row.status === 'OUTSIDE_POLICY',
          )
            ? 'Review required'
            : policy
              ? 'No review identified'
              : 'Not established'
        }
        modelStatus={workspace.capabilities.canModel ? 'Available' : 'Not configured'}
      >
        <div className="border-y border-border-hairline">
          {!policy ? (
            <ProductStateMessage state="NOT_CONFIGURED" title="Policy alignment awaiting policy">
              Establish a capital policy before observed positions can be compared with target
              structure.
            </ProductStateMessage>
          ) : !workspace.drift ? (
            <ProductStateMessage state="NO_POSITION" title="Drift analysis not established">
              The current allocation API response contains no drift analysis.
            </ProductStateMessage>
          ) : (
            workspace.drift.rows.map((row) => (
              <div
                key={row.key}
                className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_repeat(3,minmax(6rem,auto))_auto] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {row.asset ??
                      (row.classification ? classificationLabels[row.classification] : row.key)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {row.network ?? row.basis.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Current</p>
                  <p className="mt-1 text-sm tabular-nums">
                    {row.currentBps === null ? 'Valuation required' : `${percent(row.currentBps)}%`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Target</p>
                  <p className="mt-1 text-sm tabular-nums">{percent(row.targetBps)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Difference</p>
                  <p className="mt-1 text-sm tabular-nums">
                    {row.differenceBps === null
                      ? 'Unavailable'
                      : `${row.differenceBps > 0 ? '+' : ''}${percent(row.differenceBps)}%`}
                  </p>
                </div>
                <span className="text-xs text-text-muted">{driftLabels[row.status]}</span>
              </div>
            ))
          )}
        </div>
        {policy ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => run(() => leaveAllocationUnchangedAction(policy.id))}
              disabled={pending}
            >
              Leave unchanged
            </Button>
            <Button onClick={() => run(() => reviewRebalanceAction(policy.id))} disabled={pending}>
              Model decision
            </Button>
            <Button
              variant="secondary"
              onClick={() => document.getElementById('allocation-policy-name')?.focus()}
            >
              Update policy
            </Button>
          </div>
        ) : null}
      </DecisionIntelligence>

      <ModeledReview>
        <div className="border-y border-border-hairline py-5">
          {!latestPlan ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No modeled allocation plan yet">
              Create a policy and review structure before modeling decisions.
            </ProductStateMessage>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Plan · policy v{latestPlan.policyVersion}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Observed {new Date(latestPlan.observedAt).toLocaleString()}
                  </p>
                </div>
                <ProductStateBadge
                  state={
                    latestPlan.state === 'AUTHORIZED'
                      ? 'AVAILABLE'
                      : latestPlan.state === 'CANCELLED'
                        ? 'UNAVAILABLE'
                        : 'PENDING'
                  }
                >
                  {latestPlan.state.replaceAll('_', ' ').toLowerCase()}
                </ProductStateBadge>
              </div>
              <div className="mt-4 divide-y divide-border-hairline border-t border-border-hairline">
                {latestPlan.movements.length ? (
                  latestPlan.movements.map((movement) => (
                    <div key={movement.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-text-primary">
                          {movement.asset ?? movement.toClassification ?? 'Policy movement'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {movement.type.replaceAll('_', ' ').toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {movement.reason === 'valuation_required'
                          ? 'Valuation required before a movement quantity can be established.'
                          : movement.reason === 'restricted_capital'
                            ? 'Restricted capital cannot enter execution.'
                            : workspace.capabilities.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-text-muted">
                    No movement is required by the current model.
                  </p>
                )}
              </div>
              <div className="mt-4 border-t border-border-hairline pt-4">
                <ProductStateBadge state="UNAVAILABLE">
                  {workspace.capabilities.executionState === 'UNAVAILABLE' ? 'Execution unavailable' : 'Execution state not reported'}
                </ProductStateBadge>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                  Authorization records an approved decision. It does not move capital or establish
                  an executed or reconciled outcome.
                </p>
              </div>
              {latestPlan.state === 'MODELED' ? (
                <Button
                  className="mt-4"
                  onClick={() => run(() => authorizeAllocationPlanAction(latestPlan.id))}
                  disabled={pending || policy?.status !== 'AUTHORIZED'}
                >
                  Authorize plan
                </Button>
              ) : null}
            </>
          )}
        </div>
      </ModeledReview>

      <AllocationContext>
        <div className="border-y border-border-hairline">
          {workspace.activity.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No allocation decisions recorded">
              Future policy reviews and modeled changes will appear here.
            </ProductStateMessage>
          ) : (
            workspace.activity.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 border-b border-border-hairline py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-text-primary">
                  {event.action.replaceAll('_', ' ').toLowerCase()}
                </span>
                <time className="text-xs text-text-muted" dateTime={event.createdAt}>
                  {new Date(event.createdAt).toLocaleString()}
                </time>
              </div>
            ))
          )}
        </div>
      </AllocationContext>

      {result ? (
        <p className="pb-24 text-sm text-status-success sm:pb-0" role="status">
          {result}
        </p>
      ) : null}
      {error ? (
        <p className="pb-24 text-sm text-status-danger sm:pb-0" role="alert">
          {error}
        </p>
      ) : null}
    </Stack>
  );
}
