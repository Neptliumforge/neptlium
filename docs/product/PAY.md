# Neptlium Pay

**Status:** Product and architecture definition. No execution capability is activated by this document.

Neptlium Pay is the payment and collection interface of the Neptlium Capital Operating Platform.

Its initial conceptual primitives are **PAY**, **REQUEST**, **LINKS**, and **RECORDS**.

`apps/pay` owns the payment experience and public presentation boundary. `apps/api` and the existing canonical financial domains own server-side authentication, authorization, policy, provider isolation, financial lifecycle, ledger consequence, settlement evidence, reconciliation, and audit according to their existing contracts.

Pay does **not** own canonical ledger truth, canonical balances, reconciliation authority, provider secrets, compliance authority, or the ability to promote provider observations into financial truth.

A public payment token or UI completion state is presentation evidence only. Payment authorization, provider submission, settlement, ledger posting, and reconciliation remain distinct governed states. No Pay primitive may imply that provider configuration or source presence means a live payment capability.

This document does not implement Pay functionality or activate Stripe, Circle, Mercuryo, or any other provider.
