import { ApiError } from './errors.js';

export interface AllocationExecutionReadiness {
  readonly governedDomainEnabled: boolean;
  readonly providerConfigured: boolean;
  readonly providerEligible: boolean;
  readonly executionEnabled: boolean;
}

export function resolveAllocationExecutionCapability(input: AllocationExecutionReadiness) {
  return {
    canReserve: input.governedDomainEnabled && input.providerEligible && input.executionEnabled,
    canExecute: input.governedDomainEnabled && input.providerConfigured && input.providerEligible && input.executionEnabled,
  };
}

export function assertAllocationReservationWithinAvailable(amountAtomic: string, availableAtomic: string) {
  if (!/^\d+$/.test(amountAtomic) || !/^\d+$/.test(availableAtomic) || BigInt(amountAtomic) <= 0n)
    throw new ApiError(422, 'allocation_reservation_invalid', 'Allocation reservation amount is invalid');
  if (BigInt(amountAtomic) > BigInt(availableAtomic))
    throw new ApiError(409, 'insufficient_available_capital', 'Allocation reservation exceeds canonical available capital');
}
