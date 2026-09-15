# Provider Architecture Guardrails

Reject changes that:

- make a Circle/Alchemy/Stripe balance the canonical Neptlium balance;
- allow browser code to hold privileged provider credentials;
- authorize money movement solely because a provider is configured;
- expose an Alchemy-supported network as a live financial rail without separate certification;
- couple product state directly to provider SDK response types;
- retry an ambiguous money-moving provider request without recovery lookup;
- accept unsigned/unverified provider webhook evidence where official verification exists;
- create a second/shadow ledger from provider observations;
- conflate Stripe billing with capital funding;
- conflate Circle wallet provisioning with withdrawal authority;
- conflate Alchemy transaction confirmation with canonical reconciliation;
- introduce another active strategic provider through an unrelated PR without provider governance review.

These are architecture violations, not stylistic preferences.
