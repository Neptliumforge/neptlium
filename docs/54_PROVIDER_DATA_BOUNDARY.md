# Provider Data Boundary

Persist only provider data necessary for operation, evidence, support, audit and reconciliation. Prefer normalized Neptlium records plus safe provider references over uncontrolled storage of entire provider payloads.

Sensitive provider credentials never enter persistence as ordinary application records. Secrets remain in approved secret stores/runtime configuration.

Provider identifiers are external references, not stable Neptlium principal/account identities.

Data retention and access controls must follow the sensitivity and operational need of the underlying financial evidence.
