# Provider Environment Contract

## Current compatibility state

The production API currently has a legacy Base-specific Alchemy runtime contract using `ALCHEMY_API_KEY`, `ALCHEMY_ENVIRONMENT`, `ALCHEMY_RPC_URL` and `ALCHEMY_WEBHOOK_SIGNING_KEY`. Do not remove or reinterpret those variables until the multi-chain runtime migration is implemented and validated.

## Target multi-chain state

Alchemy configuration becomes per-network while retaining a shared provider identity where appropriate. Exact environment-variable names must be introduced by implementation and reflected in `.env.example`; operators must not invent variables ahead of code.

Target characteristics:

- one canonical chain registry;
- deterministic mapping from registry network to server-side RPC configuration;
- production/test network consistency validation;
- partial per-network configuration fails closed for that network;
- one network failure does not imply another network is configured;
- observation certification is independent from deposits/withdrawals/execution;
- secrets remain server-only.

## Circle

Circle credentials, environment and wallet-set configuration remain server-side. Capability verification and execution flags are independent from credential presence.

## Stripe

Stripe secret and webhook signing credentials remain server-side. Billing webhook configuration must remain distinct from any future capital-funding execution gate.

## Operator rule

Only add an environment variable after the deployed code version documents and consumes it. Configuration presence without code support is operational noise and must never be interpreted as activation.
