---
name: verify-and-stop
description: Prove existing work meets acceptance conditions without expanding scope. Use for validation-only tasks, completion checks, focused gate runs, and last-mile proof.
---

## Lifecycle

### Phase 1 (Context Sync)
Read `.devlib_state.md` for acceptance conditions and prior verification results.

### Phase 2 (Audit)
Translate acceptance conditions into the smallest sufficient proof set. Identify which checks to run.

### Phase 3 (Execution)
Run focused checks before wider gates using the rules below. Do not edit product code unless the task authorizes fixes.

### Phase 4 (Checkpoint)
Record pass/fail status and unresolved risks in `.devlib_state.md`. Stop immediately.

---

# Verify and stop

Translate acceptance conditions into smallest sufficient proof set.

- Reuse still-current results with matching repository state.
- Run focused checks before wider gates.
- Distinguish pass, fail, unavailable, and blocked exactly.
- Do not edit product code unless verification request includes fixes.
- Do not add polish, cleanup, or unrelated tests after criteria pass.

Stop immediately when acceptance proof is complete. Report commands, results, and unresolved risk only.
