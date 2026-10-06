---
name: documentation-lookup
description: "You are forbidden from writing code or architectural plans based purely on your pre-trained memory when dealing with modern, fast-changing framewor..."
---
# DOCUMENTATION-FIRST STRATEGY (NO BLIND GUESSING)

## Core Directive
You are forbidden from writing code or architectural plans based purely on your pre-trained memory when dealing with modern, fast-changing frameworks, AI tool configurations (Cursor, Claude, Codex, etc.), or external APIs. 

## Workflow Requirements
1. **Search Before Execution:** If a user requests a setup involving modern tech stacks (e.g., Next.js 14+, Tailwind v4) or AI environment rules (e.g., `.cursorrules`), you MUST use web search or your file-reading tools to fetch the latest documentation.
2. **Verify Syntax:** Never assume the syntax of a library. If you are unsure, search for the official docs or GitHub repositories to confirm the current standard.
3. **Acknowledge Findings:** Briefly state what you found in the documentation before outputting the code to prove you are not hallucinating.

**Goal:** Zero AI hallucinations. Ensure code is always accurate, secure, and aligned with the absolute latest best practices.
