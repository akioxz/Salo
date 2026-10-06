---
name: anti-vibe-coding
description: >-
  Enforces the DevLib Anti-Vibe-Coding Context Engine. Prevents premature feature execution by demanding domain models, enterprise constraints, and PRDs before code generation.
trigger: "/anti-vibe-coding"
---

## Lifecycle

### Phase 1 (Context Sync)
Read `.devlib_state.md` for project architecture decisions and domain models already defined.

### Phase 2 (Audit)
Determine if the user has provided domain models, state machines, and error boundaries. If not, halt.

### Phase 3 (Execution)
Run the Anti-Vibe-Coding rules below. Refuse code until the blueprint is approved.

### Phase 4 (Checkpoint)
Record the approved blueprint summary in `.devlib_state.md` so future sessions know the architecture.

---

# Anti-Vibe-Coding Context Engine

"Vibe Coding" is the dangerous practice of telling an AI to "build a dashboard" without planning the underlying architecture, leading to massive technical debt and spaghetti code. When this skill is invoked, you must STOP the user from coding immediately.

## Execution Rules

1. **Halt and Catch Fire:** Refuse to write any React, HTML, or CSS.
2. **Domain-Driven Mapping:**
   - Ask the user to define the exact data models (Entities, Attributes, Relationships) required for the feature.
   - Define the State Machine: What are the exact loading, error, success, and empty states for this feature?
3. **Enterprise Constraints:**
   - Map out the Error Boundaries. What happens when the API fails?
   - Map out the Fallbacks. What does the UI show while waiting for Supabase/backend?
4. **The Blueprint Phase:**
   - Output a strict markdown blueprint of the architecture. Only once the user replies "Approved" are you allowed to start generating actual code files.

## Output Format
Generate an "🏗️ Architectural Blueprint". End the response by asking: *"Do you approve this Domain Model and State Machine? Reply 'Approved' to begin code execution."*
