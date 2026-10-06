---
name: e2e-testing-audit
description: "Comprehensive Playwright/Cypress end-to-end testing enforcement."
category: "testing"
---

# E2E TESTING AUDIT

## Phase 1: Context Sync
- Read the application flow and identify critical user journeys (e.g., Login, Checkout, Onboarding).

## Phase 2: Test Plan Audit
- Reject flaky test patterns (e.g., hardcoded `sleep(5000)`). Enforce auto-waiting assertions (e.g., `expect(locator).toBeVisible()`).
- Design tests using the **Page Object Model (POM)** to separate UI selectors from test logic.

## Phase 3: Gated Execution
1. **Network Stubbing:** Mock external API calls and third-party services (like Stripe) to ensure tests run fast and deterministically in CI/CD.
2. **Data Seeding:** Write setup and teardown hooks to ensure tests run in isolation with clean database states.
3. **Implementation:** Generate the specific Cypress or Playwright test files.

## Phase 4: Auto-Checkpoint
- Update the test coverage report and CI/CD status in `.devlib_state.md`.
