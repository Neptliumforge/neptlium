# Provider Failure Model

Provider failures are normalized into Neptlium semantics before they reach product/domain consumers.

## Categories

- configuration — invalid/missing server configuration;
- authentication — provider credential rejection;
- authorization — provider-side permission denial distinct from Neptlium authorization;
- rate_limited — provider throttling;
- unavailable — provider/network service unavailable;
- invalid_request — provider rejected malformed/unsupported request;
- ambiguous_outcome — request may have reached the provider and economic effect is unknown;
- provider_rejected — provider definitively rejected the requested operation;
- unknown — safely normalized unclassified failure.

## Retry doctrine

Retryability is explicit and operation-aware. Never blindly retry an externally mutating request after timeout. `ambiguous_outcome` requires controlled provider/idempotency lookup before deciding whether another submission is safe.

## Product doctrine

Provider errors must not leak secrets or provider SDK internals into product contracts. Product surfaces receive safe Neptlium error semantics and truthful lifecycle state.
