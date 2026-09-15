# Provider API Boundary

External/client APIs expose Neptlium resources, intents, capabilities and lifecycle states. They should not expose provider SDK objects as primary contracts.

Provider-specific references may be surfaced where useful for support/audit, but clients must not need Circle, Alchemy or Stripe response schemas to understand canonical Neptlium state.

Provider routing remains an internal implementation detail unless a public API explicitly requires a rail/network choice.
