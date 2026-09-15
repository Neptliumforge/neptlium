# Provider Observability Standard

Provider telemetry exists to explain infrastructure behavior without becoming financial truth.

## Required safe dimensions

Where available and non-sensitive, structured provider telemetry should include Neptlium intent/correlation identity, provider, operation, environment, chain/network or rail, normalized outcome, latency, retry/lookup disposition and safe provider reference.

## Prohibited telemetry

Never log API keys, Circle entity secrets, webhook signing secrets, authorization headers, private/signing material, full sensitive webhook payloads or credentials embedded in RPC URLs.

## Metrics

Track configuration/connectivity failures, request latency, normalized provider errors, webhook verification failures, duplicate/replay suppression, ambiguous submissions, controlled lookups, provider degradation and reconciliation lag. Metrics must not fabricate balances, settlement or availability.

## Alerts

Alert on signature failures, sustained provider unavailability, elevated ambiguous outcomes, reconciliation backlog, repeated idempotency collisions and unexpected network/rail mismatches. Alerting should identify the affected capability rather than globally declaring Neptlium financial state invalid.

## Status projection

Provider status must distinguish unconfigured, configured, connectivity verified, capability certified and execution-enabled capability counts. A green provider health check is not equivalent to a certified financial capability.
