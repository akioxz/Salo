---
name: investigate-first
description: Diagnose ambiguous failures before editing. Use for unknown causes, intermittent behavior, performance regressions, or investigations needing evidence-ranked hypotheses.
---

## Lifecycle

### Phase 1 (Context Sync)
Read `.devlib_state.md` for known bugs, recent changes, and prior investigation notes.

### Phase 2 (Audit)
Separate observed symptom from inferred cause. List candidate hypotheses.

### Phase 3 (Execution)
Trace inputs, state transitions, ownership boundaries, and failure output using the rules below. Do not edit product code until one credible mechanism explains the evidence.

### Phase 4 (Checkpoint)
Record the confirmed cause, evidence collected, and remaining unknowns in `.devlib_state.md`.

---

# Investigate first

Gather evidence before changing product code.

- Separate observed symptom from inferred cause.
- Trace inputs, state transitions, ownership boundaries, and failure output.
- Rank hypotheses by evidence and cheap falsification value.
- Do not edit until one credible mechanism explains evidence.
- Stop exploration when evidence is sufficient to name cause or exact blocker.

Report cause and proof. Make no fix unless task authorizes implementation.
