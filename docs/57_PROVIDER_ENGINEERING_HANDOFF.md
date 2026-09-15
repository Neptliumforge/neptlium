# Provider Engineering Handoff

The canonical doctrine is now represented in this branch as documentation plus API control-plane primitives.

Next engineering execution must start by validating this branch and reconciling it with open stacked Platform Core/Treasury provider work. In particular, do not merge duplicate provider orchestration contracts or retain an active provider role that conflicts with the current Circle/Alchemy/Stripe primary-provider doctrine.

The runtime migration should then wire the canonical chain registry/per-network Alchemy endpoints into the existing provider runtime, retire Base-only validation after replacement coverage passes, and preserve all Circle/Stripe economic execution gates.

Production credentials, provider resources, capability flags, database state and money movement are outside this branch's implementation scope and remain separately authorized.
