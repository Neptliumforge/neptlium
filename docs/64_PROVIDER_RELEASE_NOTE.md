# Provider Doctrine Release Note

This architecture release formalizes Neptlium's provider control plane. Circle, Alchemy and Stripe are now modeled as distinct replaceable infrastructure roles beneath Neptlium API/Platform Core, with typed capability/evidence/readiness/policy primitives and a multi-chain Alchemy target registry.

The release does not activate live financial execution. Existing production provider configuration and runtime behavior remain subject to explicit certification and operational gates.
