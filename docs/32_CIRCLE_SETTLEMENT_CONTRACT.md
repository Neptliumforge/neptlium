# Circle Settlement Contract

Circle is Neptlium's primary adapter for explicitly certified stablecoin/digital-money wallet and settlement infrastructure.

## Responsibilities

Circle may provide reviewed wallet/address infrastructure, supported stablecoin rails, provider transfer/settlement operations, transaction lookup and signed provider event evidence.

## Authority boundary

Circle does not own Neptlium principal/organization authorization, approval policy, available balance, canonical ledger or reconciliation. Circle provider balance and transaction status remain external evidence.

## Capability granularity

Wallet provisioning, stablecoin deposits and stablecoin withdrawals are separate capabilities. Configuration and capability verification do not automatically enable execution. Withdrawal execution requires the separately reviewed Circle execution gate plus Neptlium authorization/policy/approval and reconciliation contracts.

## Chain composition

Circle support for an asset/network pair and Alchemy observation support for that chain are independent prerequisites. Neptlium may expose a product capability only when the complete asset/network/provider/evidence/reconciliation contract is certified.

## Settlement

Provider success or transfer submission does not itself establish canonical settlement. Neptlium determines settlement from the applicable provider/chain evidence and posts financial truth only through governed reconciliation.
