# Provider Observability

## Objective

Neptlium must be able to determine provider health and financial lifecycle health without confusing operational telemetry with financial truth.

## Provider telemetry

For Circle, Alchemy and Stripe, capture safe operational signals such as:

- request success/failure rates;
- latency;
- webhook/event ingress lag;
- duplicate/rejected event counts;
- provider lookup/recovery outcomes;
- network/rail availability;
- reconciliation exception counts;
- intent age by lifecycle state;
- ambiguous submission count.

Never emit secret keys, signing material, authorization headers or unnecessary sensitive provider payloads.

## Health model

Provider/capability health should support explicit states such as `healthy`, `degraded`, `unavailable`, `restricted` and `unknown`.

Health is scoped by capability. An Alchemy RPC degradation on one chain must not automatically imply Stripe billing is unavailable. Circle wallet lookup health does not imply Circle transfer execution is enabled.

## Product behavior

Product surfaces consume normalized capability/health state from Neptlium APIs. They must not query provider dashboards or SDKs directly to determine whether a financial action should be offered.

`unknown` or `degraded` states must never be presented as confirmed financial success.

## Audit versus metrics

Metrics support operations. Audit records explain authoritative decisions and lifecycle transitions. Metrics are not a substitute for durable financial audit/reconciliation evidence.
