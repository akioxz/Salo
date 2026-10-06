---
name: telemetry-first-mvp
description: "Enforces the inclusion of product analytics in feature development."
category: "business-logic"
---

# TELEMETRY-FIRST MVP

## Directive
"You cannot improve what you do not measure." Based on Y Combinator growth principles, every new user-facing feature must be trackable from day one.

## Enforcement
1. **Event Tracking:** When generating UI components (especially Core Conversion actions like Sign Up, Subscribe, or Create), automatically include placeholder telemetry events (e.g., `trackEvent('Clicked Subscribe')`).
2. **Error Logging:** When writing backend service logic or API routes, ensure critical failure points log the error with sufficient context (User ID, Action) to a monitoring service.
3. **Data-Driven Feedback:** Prompt the user to review the analytics events you've included to ensure they align with their Key Performance Indicators (KPIs).
