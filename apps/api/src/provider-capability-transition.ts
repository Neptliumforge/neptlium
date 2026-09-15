import type { ProviderCapabilityState } from './provider-capabilities.js';

const allowedTransitions: Readonly<Record<ProviderCapabilityState, readonly ProviderCapabilityState[]>> = {
  configured: ['connectivity_verified'],
  connectivity_verified: ['capability_certified'],
  capability_certified: [],
};

export function canTransitionProviderCapability(from: ProviderCapabilityState, to: ProviderCapabilityState): boolean {
  return allowedTransitions[from].includes(to);
}

export function requireProviderCapabilityTransition(from: ProviderCapabilityState, to: ProviderCapabilityState): void {
  if (!canTransitionProviderCapability(from, to)) throw new Error(`invalid provider capability transition: ${from} -> ${to}`);
}
