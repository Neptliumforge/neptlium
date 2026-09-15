# Provider Operating Model

## Build

Engineering implements provider adapters and Neptlium contracts behind the API boundary. New capabilities begin disabled/non-certified.

## Verify

Configuration and connectivity are verified without treating them as live financial capability. Webhook/evidence, idempotency, failure recovery, policy and reconciliation are validated separately.

## Certify

The exact capability tuple is certified only after its applicable release gates pass. Certification is granular; one certified network/rail/operation does not certify another.

## Enable

Externally mutating financial capability is enabled only after separate operational authorization. Enabling must be reversible without corrupting canonical state.

## Operate

Monitor provider health, evidence ingress, ambiguous outcomes and reconciliation lag. Operational provider health does not replace financial state.

## Degrade / recover

Disable affected capability, preserve durable intent/evidence, avoid blind duplicate submission, reconcile in-flight operations, then re-certify/re-enable as required.
