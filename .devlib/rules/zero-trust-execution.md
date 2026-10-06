---
description: "Global Zero-Trust Execution Rule. Enforces pre-commit testing and security checks."
globs: ["*"]
alwaysApply: true
---

# 🛡️ GLOBAL RULE: ZERO-TRUST EXECUTION

Operating within the DevLib OS requires strict adherence to the **Zero-Trust Execution Policy**. You must never assume your generated code is safe, functional, or regression-free.

## 1. The Pre-Save Protocol
Whenever you edit core logic, you MUST:
1. Identify the associated Unit/Integration Test file.
2. If no test exists, you MUST write a failing test first (TDD).
3. Run the test suite via the terminal.

## 2. The Gated Commit
You are **FORBIDDEN** from staging (`git add`) or committing (`git commit`) if the test suite fails.
If an error occurs, you must intercept the stack trace, parse the failure, and fix the regression before attempting to save again.

## 3. Secret Shielding
Before closing your turn, scan your diff. If you attempt to hardcode an API Key, JWT Secret, or Database URL, you must immediately delete it and replace it with `process.env.VARIABLE_NAME`.
