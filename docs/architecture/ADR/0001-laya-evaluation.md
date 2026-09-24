# ADR 0001 — Laya Evaluation for Non-Canonical Decision Intelligence

**Status:** Evaluation only — not adopted, installed, downloaded, deployed, or integrated.

## Context

Laya is an open-source, non-autoregressive typed-decision model family published by ConvAI Innovations. The upstream project describes `choice`, `score`, and boolean-probability (`noul`) decisions over text/JSON in one forward pass, with English, multilingual, and typed-decision checkpoints. Upstream reports roughly 33 ms single-question T4 latency for its routed models and explicitly recommends domain fine-tuning because zero-shot accuracy can be materially lower than specialized accuracy.

Sources reviewed 2026-09-24:
- upstream repository: https://github.com/NandhaKishorM/laya
- model hub: https://huggingface.co/convaiinnovations/laya

These are upstream claims and benchmarks, not Neptlium measurements.

## Architectural law

**MODEL OUTPUT = SIGNAL. MODEL OUTPUT != AUTHORITY.**

A model must never independently authorize payments or withdrawals; change balances; post ledger entries; establish settlement or reconciliation; approve KYC/compliance; override policy; activate providers; execute provider actions; or change canonical financial truth.

## Candidate uses

Future evaluation may cover transaction/activity categorization, support routing, payment-event triage, notification prioritization, document classification, merchant/category classification, and anomaly **signals**. Each use must terminate in an existing deterministic policy/human/governed command boundary when consequence is material.

## Comparison

| Dimension | Deterministic rules | Laya-like fast decision model | Frontier reasoning model |
| --- | --- | --- | --- |
| Latency | lowest/predictable | low after warm load; hardware dependent | usually higher/variable |
| Cost | low | self-host compute/model operations | API or large inference cost |
| Accuracy | high on explicit rules, brittle on ambiguity | empirical/domain-dependent | strong on complex ambiguous reasoning |
| Determinism | highest | probabilistic scores with fixed model/schema | probabilistic |
| Explainability | explicit rule trace | probabilities/schema; limited semantic rationale | richer rationale, not authority evidence |
| Privacy | local rules | can be self-hosted | deployment/provider dependent |
| Operations | simplest | model weights, serving, calibration, monitoring | provider/model routing, prompt/eval governance |
| Failure mode | missed/incorrect rule | confident misclassification, truncation, domain shift | hallucination/reasoning error, latency/cost variance |
| Neptlium fit | authority/policy | high-volume noncanonical triage candidate | complex analysis/escalation candidate |

## Benchmark before adoption

Use a versioned, de-identified Neptlium-like evaluation set with frozen labels and explicit task schemas. Compare deterministic baseline, Laya candidate, and a frontier reasoning baseline on accuracy/F1 as appropriate, calibration/Brier score, abstention quality, false-positive/false-negative cost, p50/p95 latency, throughput, compute/API cost, multilingual behavior, long-input truncation, privacy constraints, and failure under malformed/adversarial inputs.

Separate training/tuning data from final evaluation. Define minimum task-specific thresholds before testing. Record model/checkpoint/version, hardware, schema, dataset version, and seeds/configuration. No benchmark may contain live credentials or customer financial secrets.

A future adoption decision requires benchmark evidence, privacy/security review, operational ownership, rollback design, monitoring, and an explicit statement of the deterministic authority boundary.
