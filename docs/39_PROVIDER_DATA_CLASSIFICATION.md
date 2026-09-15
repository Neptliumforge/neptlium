# Provider Data Classification

## Restricted secrets

Circle API/entity secrets, Stripe secret keys/webhook secrets, Alchemy API/webhook signing secrets, private/signing material, authorization headers and Supabase service-role credentials are restricted server-only data.

## Sensitive operational data

Raw provider webhook payloads, customer/provider identifiers, transaction references, wallet addresses linked to principals, failure diagnostics and reconciliation evidence may be sensitive operational data and should be exposed only to authorized systems/operators as necessary.

## Safe operational metadata

Provider name, normalized capability state, non-sensitive network/rail identity, safe correlation IDs, normalized error category and aggregate health/latency may be used in controlled telemetry when they do not reveal customer financial information or secrets.

## Public data

Public documentation may describe provider architecture and supported concepts only when factual and verified. It must not expose secrets or imply live provider capability from planned/configured architecture.
