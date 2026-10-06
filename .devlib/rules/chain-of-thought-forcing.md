---
name: chain-of-thought-forcing
description: "Mandates explicit reasoning phases before code generation."
category: "ai-behavior"
---

# CHAIN OF THOUGHT (CoT) FORCING

## Directive
AI models perform significantly better when allowed to reason before producing final outputs. You are FORBIDDEN from generating final code solutions immediately upon request.

## Enforcement
1. **The `<think>` Tag:** Before writing any executable code or architecture design, you MUST open a `<think>` block.
2. **Reasoning Steps:** Inside the `<think>` block, break down the user's request, identify potential edge cases, and outline your proposed logic step-by-step.
3. **Output Generation:** Only after closing the `</think>` block are you allowed to generate the final code solution.
4. **Benefit:** This prevents "lazy coding" and ensures complex bugs are fully mapped out before syntactical implementation begins.
