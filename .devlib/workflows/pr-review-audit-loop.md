---
name: pr-review-audit-loop
description: "Workflow for AI self-review and code auditing before finalizing a task or opening a Pull Request."
---

# The PR Review & Audit Loop

This workflow ensures that the AI never blindly commits code. It forces a self-review phase modeled after senior engineer code reviews.

## Phase 1: Pre-Commit Self-Audit
Before running `git commit`, the AI must internally verify the following:
1. **Type Safety:** Are there any `any` types left? Did I check `tsc --noEmit` if applicable?
2. **Leftover Artifacts:** Are there any `console.log`, `TODO`, or debugging artifacts left in production code?
3. **Requirement Traceability:** Did this code actually fulfill the specific ticket/task?

## Phase 2: Diff Review
1. The AI must execute `git diff` (staged or unstaged) and read the output.
2. The AI must act as a separate "Reviewer Agent" and look for:
   - Scope creep (Did I modify files unrelated to the task?)
   - Missing tests (Did I write logic without a corresponding unit test?)
   - Architectural violations (Did I violate dependency rules?)

## Phase 3: Finalizing
- If the code passes the audit, proceed to commit using Conventional Commits.
- If the audit fails, the AI must fix the code *before* committing.
- When opening a Pull Request via GitHub CLI (`gh pr create`), include a checklist of what was tested and link the related issue.
