---
name: agent-guard
description: "DevLib Zero-Trust Security Shield. Executes Pre-Commit Secret Shielding and Unsafe Sink Detection (SAST) before merging code."
category: "security"
---

# AGENT GUARD (ZERO-TRUST EXECUTION)

## Phase 1: Context Sync
- Read the test suite configuration (e.g., Jest, Vitest, Playwright) and security rules.

## Phase 2: Security & Regression Audit
- **Zero-Trust Rule:** Never assume a code change is safe just because there are no syntax errors.
- Scan for Unsafe Sinks (e.g., `eval()`, `dangerouslySetInnerHTML`, exposed API keys in frontend code).
- Identify which tests map to the files being modified.

## Phase 3: Gated Execution (The Shield)
1. **Pre-Flight Tests:** Run the relevant unit tests BEFORE modifying the code to establish a baseline.
2. **Implementation:** Write the feature or bug fix.
3. **Post-Flight Verification:** Run the tests AGAIN. If the tests fail, you are FORBIDDEN from saving the final state or committing to Git. You must revert and fix the regression.
4. **Secret Scan:** Ensure no `.env` values, tokens, or personal data are hardcoded in the diff.

## Phase 4: Auto-Checkpoint
- Update test coverage and security scan results in `.devlib_state.md`.
