---
name: autonomous-dev-workflow
description: "Strict rules for autonomous developer workflows, git worktree isolation, systematic debugging, and Test-Driven Development (TDD)."
trigger: model_decision
---

# Dev-Library Rule Extensions: Autonomous Dev & Workflow

## 1. Autonomous Developer Workflows & Planning
- **Mandatory Task Planning**: Before implementation, decompose design specs into granular, bite-sized tasks (2-5 minutes execution scope). Every task must specify exact file paths, interface changes, and explicit verification commands (e.g., test scripts). Plans must be saved to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`. (Prevents AP-1, AP-3, AP-6)
- **Subagent-Driven Execution**: Execute multi-task plans task-by-task using isolated fresh-context implementer subagents to prevent context degradation (Prevents AP-2). Each subagent handles exactly one task, verified via tests.
- **Two-Stage Review Orchestration**: Before merging a task, a fresh-context reviewer subagent must evaluate the code for both Spec Compliance and Code Quality. Unreviewed commits are strictly prohibited.

## 2. Git Protocols & Workspace Isolation
- **Git Worktree Isolation**: All new feature development must occur in isolated git worktrees (`git worktree add -b <branch> .worktrees/<feature>`) to protect main working directories from uncommitted pollution.
- **Explicit Consent**: Require explicit user consent before creating a new worktree.
- **Baseline Verification**: Before beginning coding in a new worktree, the baseline test suite must be run and pass with zero errors (Prevents AP-9).
- **Safe Branch Closeout**: When a feature is complete, verify a 100% clean test suite and 0 untracked/uncommitted changes. Present merge/PR/keep options to the user. Safely remove the worktree using `git worktree remove` without force deletion of untracked files.

## 3. Systematic Debugging Protocol
- **4-Phase Investigation**: Never use speculative, trial-and-error code edits. Implement a 4-phase protocol for bugs/regressions:
  1. **Minimal Reproduction**: Write an automated test/script that deterministically reproduces the bug *before* modifying any logic.
  2. **Isolation & Bisection**: Pinpoint the exact state divergence line (file, line number, and state variable).
  3. **Hypothesis Formulation**: Explicitly state the hypothesis for the failure mechanism and test it via a minimal diagnostic edit.
  4. **Targeted Fix & Regression Proof**: Apply the fix, verify the reproduction test passes, and prove no regressions exist by running the full test suite.

## 4. Test-Driven Development (TDD) Implementation
- **Strict Red-Green-Refactor**: Enforce falsifiable test failure before production coding.
  - **Red Phase**: Write a minimal unit test covering the requirement. It must fail with the explicitly expected error message.
  - **Green Phase**: Write the *minimal* production code necessary to make the failing test pass. Stop if edits exceed the minimum needed.
  - **Refactor Phase**: Clean the code based on design principles and function design rules. Ensure the full test suite remains green.
- **Retrospective Testing**: If code changes are completed without tests, halt immediately and retroactively write failing tests to prove the logic.

## 5. Code Review & PR Standards
- **Pre-Review Audits (Requesting)**: Before requesting a review or opening a PR, run a compliance audit (`node scripts/audit-compliance.js`), ensure 100% test coverage, and inspect the `git diff` for unexpected file edits or leftover debug artifacts.
- **Structured PR Packaging**: Generate a structured PR description summarizing goals, spec references, verification evidence (build/test status), and key modified files.
- **Feedback Processing (Receiving)**:
  1. **Parse & Categorize**: Extract reviewer comments into a structured Action Item Checklist mapped to specific file/line numbers.
  2. **TDD Execution**: Implement modifications via strict TDD—write/update a test for the requested change *before* updating code.
  3. **Verification & Response**: Run the full test suite, then generate a structured response report matching action items to test evidence.
