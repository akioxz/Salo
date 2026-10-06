---
name: strict-skill-reading-gate
description: "You are strictly FORBIDDEN from assuming or guessing the instructions, logic, or workflow of a skill based merely on its directory name or summary ..."
---
# STRICT SKILL-READING GATE (ZERO GUESSWORK)

## Core Directive
You are strictly FORBIDDEN from assuming or guessing the instructions, logic, or workflow of a skill based merely on its directory name or summary listed in your system prompt.

## Workflow Requirements
1. **Mandatory File Reading:** Whenever a task falls under the domain of an existing DevLib skill (e.g., you see a relevant path like `skills/api-design/SKILL.md` in your prompt), your absolute FIRST action must be to use the `view_file` command to read the exact, full contents of that file.
2. **Never Rely on Name Association:** Do not generate code thinking you "already know" what TDD, UI Design, or API Architecture is. You must execute exactly according to the specific strictures written in the user's `SKILL.md`.
3. **Index Targeting:** Do not read more than 3 skills at a time to preserve token context. Identify the most critical skill, read it, and apply it.

**Goal:** Eliminate AI hallucination. Ensure that the AI executes workflows exactly as architected by the user in the DevLib, not based on generic pre-trained knowledge.
