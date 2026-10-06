---
name: continuous-checkpointing
description: "The user operates on a Free-Tier workflow and may be AFK (Away From Keyboard). Token limits may abruptly kill the session at any moment. To prevent..."
---
# CONTINUOUS AUTO-CHECKPOINTING (AFK & MODEL-SWITCHING RESILIENCE)

## Core Directive
The user operates on a Free-Tier workflow and may be AFK (Away From Keyboard). Token limits may abruptly kill the session at any moment. To prevent "Model-Switching Amnesia" and lost context, you MUST auto-save your progress continuously.

## Workflow Requirements
1. **The Auto-Save Rule:** Do not wait for the end of a session to log your progress. After completing ANY logical micro-task (e.g., successfully fixing a bug, creating a new component, or passing a test), you MUST update a local state file (e.g., `project-status.md` or `CLAUDE.md`) in the background.
2. **Checkpoint Content:** The auto-save log must include:
   - What was just completed.
   - What the current active problem/bug is.
   - The exact next step the succeeding AI model needs to take.
3. **The Resume Protocol (Cold Start):** Whenever a new session begins, your absolute FIRST action is to read the auto-save state file to sync your context with the previous AI model before generating any new plans or code.

**Goal:** Seamless handoffs between different AI models. If the session crashes or tokens run out, the next model can pick up exactly where you left off.
