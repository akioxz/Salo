---
name: function-design
description: "DevLib component."
---
# Rule: Function Design

> **Purpose:** Structural rules for every function an agent or developer writes. Attach this rule when generating application logic so functions stay small, honest about effects, and self-documenting.

## 1. Scope, Size, and Complexity
- **Small Single-Purpose Functions:** A function must do one thing. If you can label chunks of a function with different names, split it.
- **One Level of Abstraction per Function:** High-level functions read like a table of contents. Call lower-level functions instead of inlining details.
- **Minimize Argument Count:** Aim for 0-2 arguments. Wrap 3+ parameters into a structured options object.
- **Cognitive Complexity Target:** Keep cognitive complexity at or below 15. Avoid deep nesting, complex conditional chains, or long subroutines.

## 2. Pure Functions and Execution Flow
- **Pure Functions First:** Prefer pure functions that compute output solely from input parameters without modifying external state.
- **No Parameter Reassignment:** Data flows in through parameters and out through return values. Treat input arguments as immutable references.
- **No Flag Arguments:** Do not pass boolean flags to select execution paths. Split the paths into separate named functions. Data booleans remain allowed (e.g., `setVisible(true)`).
- **Command Query Separation (CQS):** A function either performs an action (command) or returns data (query), never both.
- **No Hidden Side Effects:** A function name is a contract. If a function performs effects beyond its name (e.g., `checkPassword()` resetting a session), rename it honestly or move the effect out.
- **Early Return Guard Pattern:** Handle errors and edge cases at the top of functions using early returns. Avoid nested `if`/`else` chains.

## 3. Code Documentation
- **JSDoc / Docstring Coverage:** Document every exported function, class, and utility. Include parameters, return values, and thrown errors. Describe contracts, not signatures.
- **Inline Comments Sparingly:** Add inline comments only for non-obvious logic (workarounds, performance trade-offs, external constraints). Code explains what. Comments explain why.
- **Comment Hygiene:** Keep comments current within the same edit as the code change. Delete stale comments immediately. Never leave commented-out code.

## 4. File Layout
- **Headline First:** Place the highest-level function at the top of each source file so a reader learns what the module does within three lines.
- **Stepdown Order:** Define every function below its first caller. Files read top-to-bottom from high-level intent to low-level detail.
- **Declare Near Use:** Introduce each local variable immediately before its first use. Never hoist declarations to the top of long functions.
