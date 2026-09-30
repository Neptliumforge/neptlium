export type CustomerState =
  | 'LOADING'
  | 'EMPTY'
  | 'AVAILABLE'
  | 'PENDING'
  | 'RESTRICTED'
  | 'UNAVAILABLE'
  | 'FAILED';

export type CustomerStateView = {
  readonly state: CustomerState;
  readonly label: string;
};

export function customerStateFromCapability(state: string): CustomerStateView {
  switch (state.toUpperCase()) {
    case 'ENABLED': return { state: 'AVAILABLE', label: 'Available' };
    case 'INELIGIBLE':
    case 'RESTRICTED': return { state: 'RESTRICTED', label: 'Restricted' };
    default: return { state: 'UNAVAILABLE', label: 'Unavailable' };
  }
}

export function customerStateFromLifecycle(state: string): CustomerStateView {
  const value = state.toUpperCase();
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(value)) return { state: 'FAILED', label: 'Failed' };
  if (['RECONCILED', 'SETTLED', 'AVAILABLE'].includes(value)) return { state: 'AVAILABLE', label: value === 'AVAILABLE' ? 'Available' : 'Completed' };
  if (['RESTRICTED', 'INELIGIBLE'].includes(value)) return { state: 'RESTRICTED', label: 'Restricted' };
  return { state: 'PENDING', label: 'Processing' };
}

export function customerCollectionState<T>(
  projection: { readonly state: 'READY'; readonly data: readonly T[] } | { readonly state: 'UNAVAILABLE' },
): CustomerState {
  if (projection.state !== 'READY') return 'UNAVAILABLE';
  return projection.data.length === 0 ? 'EMPTY' : 'AVAILABLE';
}
