---
name: architecture-decision-records
description: Rule to enforce the documentation of Architecture Decision Records (ADRs) whenever a structural choice is made.
---

# Rule: Architecture Decision Records (ADRs)

> **Purpose:** Ensures the "why" behind major engineering decisions is documented for future maintainers (and for your thesis defense).

## When to Log an ADR
You must generate an ADR in the `docs/ADR/` directory whenever a non-trivial architectural choice is made. A choice is non-trivial if it is hard to reverse. Examples include:
- Changing a core library (e.g., Redux to Zustand).
- Modifying the database schema strategy (e.g., NoSQL vs SQL).
- Choosing a specific rendering pattern (e.g., SSR vs CSR).
- Adopting a specific 3D technique (e.g., InstancedMesh vs Individual Meshes).

## ADR Format
Create a markdown file named `YYYY-MM-DD-short-title.md` (e.g., `2026-09-20-use-zustand-for-3d-state.md`) with the following structure:

```markdown
# [Title of the Decision]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Deprecated]

## Context
What is the problem we are trying to solve? Why is a decision needed now?

## Considered Options
1. [Option A]
2. [Option B]

## Decision
What is the final choice and why? (Cite official documentation if applicable).

## Consequences
What becomes easier? What becomes harder? (e.g., "Easier to manage global state, but adds 3kb to bundle size").
```
