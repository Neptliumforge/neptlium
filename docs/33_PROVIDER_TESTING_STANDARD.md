# Provider Testing Standard

Provider integrations require tests at the contract boundary, not only happy-path SDK calls.

## Configuration tests

- missing required credential/configuration;
- partial configuration;
- production/test mismatch;
- unsupported network/rail;
- mainnet gate behavior;
- configured state never implies execution.

## Event tests

- valid signature;
- invalid/missing signature;
- duplicate delivery;
- out-of-order delivery;
- stale/replayed event behavior;
- unknown provider reference;
- safe normalization.

## Execution tests

Before any live execution gate can pass:

- unauthorized intent rejected;
- policy/approval failure rejected;
- stable idempotency behavior;
- provider rejection;
- timeout before known submission;
- ambiguous timeout after possible submission;
- lookup/recovery;
- duplicate client retry;
- settlement observation;
- reconciliation success;
- reconciliation conflict/manual review.

## Multi-chain tests

Each Alchemy-backed network requires independent configuration and capability tests. A passing Base test must never certify Ethereum, Arbitrum, Optimism, Polygon or another network.

## Cross-provider tests

Where Circle and Alchemy provide evidence for one lifecycle, tests must cover matching evidence, missing evidence and conflicting evidence. Neptlium reconciliation remains authoritative.

## Stripe separation tests

Billing configuration must not surface capital-funding capability. Any future funding adapter requires its own intent, idempotency, webhook, ledger and reconciliation tests.
