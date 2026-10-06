---
name: surgical-patch
description: Fix bugs and small behavior changes at the narrowest responsible layer. Use when regression proof, preserved surrounding behavior, and task-relevant tests matter.
---

## Lifecycle

### Phase 1 (Context Sync)
Read `.devlib_state.md` for known bugs, test status, and recent patches.

### Phase 2 (Audit)
Reproduce the failure or capture strongest available evidence. Trace symptom to responsible mechanism.

### Phase 3 (Execution)
Change the narrowest layer that owns incorrect behavior using the rules below. Add regression proof.

### Phase 4 (Checkpoint)
Record the fix, regression test name, and verification result in `.devlib_state.md`.

---

# Surgical patch

Reproduce failure first when economical; otherwise capture strongest available evidence.

- Trace symptom to responsible mechanism.
- Change narrowest layer that owns incorrect behavior.
- Preserve unrelated behavior and user changes.
- Avoid cleanup, renaming, and abstraction outside fix.
- Add only regression proof relevant to task.

Run focused proof plus nearest affected gate. Stop when failure is fixed and regression proof passes.
