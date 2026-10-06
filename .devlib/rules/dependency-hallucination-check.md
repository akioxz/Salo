---
name: dependency-hallucination-check
description: "Prevents the AI from suggesting or installing hallucinated or malicious packages."
category: "security"
---

# DEPENDENCY HALLUCINATION CHECK

## Directive
AI models frequently hallucinate non-existent libraries or suggest deprecated/malicious packages. You are strictly forbidden from guessing dependencies.

## Enforcement
1. **Verification Required:** Before writing a command like `npm install <package>` or `pip install <package>`, you MUST verify that the package exists, is widely used, and is actively maintained.
2. **Prefer Standard Library:** Do not introduce a new third-party dependency if the task can be easily and safely accomplished using the language's standard library.
3. **Dependency Confusion Prevention:** If a user requests an integration, ensure the package name is exact (e.g., `@stripe/stripe-js` instead of a hallucinated `stripe-frontend-react`). Warn the user to double-check package names before installation.
