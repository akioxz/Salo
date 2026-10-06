---
name: systematic-debugging
description: "Structured root cause investigation protocol requiring reproduction, bisection, hypothesis testing, and regression proof."
triggers: ["bug", "error", "fail", "regression", "/systematic-debug"]
context_dependencies: ["CLAUDE.md", "project-status.md", "Error Logs"]
---

# SYSTEMATIC DEBUGGING (AGENTIC OS COMPONENT)

## PHASE 1: Context Sync & Research (No Coding)
1. **Cold-Start Sync:** Before writing any diagnostic script, explicitly read `CLAUDE.md` or `project-status.md` to synchronize with any previous AI sessions. Do not guess the state of the project.
2. **Documentation Check:** If the error involves a specific framework (e.g., Next.js, Prisma, Expo), use your search tools to cross-reference the exact error code with external documentation. Do not rely solely on your pre-trained memory.

## PHASE 2: Purpose, Isolation, & Blueprint
1. **Minimal Reproduction:** Write a minimal automated test or script to reproduce the bug deterministically. Isolate the failure from the rest of the application.
2. **Isolation & Bisection:** Trace the execution path backwards to pinpoint the exact line or state variable causing divergence.
3. **Formulate Hypothesis:** You MUST state an explicit hypothesis for *why* the failure occurs. (e.g., "My hypothesis is [X] because [Y]"). 
4. **Approval Gate:** Ask the user to acknowledge the hypothesis before applying sweeping changes.

## PHASE 3: Gated Execution
1. **Targeted Fix:** Apply the fix exclusively to the isolated root cause. No speculative or "trial-and-error" edits allowed.
2. **Regression Proof:** Verify that the minimal reproduction test now passes AND the rest of the module remains unaffected.

## PHASE 4: Auto-Checkpoint Exit (MANDATORY)
Before ending this task and handing execution back to the user, you MUST update `CLAUDE.md` or `project-status.md` in the background. Log exactly what bug was fixed, what files were touched, and what the next logical step is. This ensures context survival if token limits are reached.
