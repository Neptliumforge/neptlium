# Provider Security Threat Model

## Protected assets

Provider API credentials, Circle entity secrets, webhook signing secrets, Neptlium authorization state, transaction intents, idempotency identities, provider references, canonical ledger state and reconciliation evidence are protected assets.

## Trust boundaries

Browsers and provider callbacks are untrusted inputs. `apps/api` is the privileged boundary. Provider responses are external evidence. Supabase service-role and provider credentials never cross into browser authority.

## Principal threats and controls

**Secret leakage:** keep privileged values server-only; never log or expose through public environment prefixes.

**Webhook forgery/replay:** verify official signatures and tolerance/replay controls; process durably and idempotently.

**Duplicate economic submission:** require Neptlium idempotency and provider idempotency where available; perform lookup after ambiguous timeout before retry.

**Provider/account compromise:** provider success cannot bypass Neptlium authorization, policy, approvals or reconciliation; maintain limits and independent audit evidence.

**Chain spoofing/misconfiguration:** canonical chain registry validates endpoint/network mapping; independently certify each network.

**Observation poisoning/staleness:** observations remain non-canonical; apply confirmation/finality policy and reconciliation before posting financial truth.

**Privilege escalation from UI:** browser state, hidden controls and client role claims never authorize provider execution.

**Cross-provider responsibility leakage:** operation ownership and capability selection fail closed when a provider is asked to perform an operation outside its reviewed role.

## Incident posture

Provider degradation or suspected compromise should disable the affected capability without rewriting canonical balances. Preserve intents and evidence, stop unsafe retries, reconcile in-flight operations and retain auditable incident chronology.
