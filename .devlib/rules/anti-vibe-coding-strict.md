---
name: anti-vibe-coding-strict
description: "**Context:** This rule enforces Senior-Level Agentic Engineering discipline. It prevents the AI from 'vibe-coding'—guessing, spraying CSS hacks, pu..."
---
# STRICT ANTI-VIBE-CODING PROTOCOL
**Context:** This rule enforces Senior-Level Agentic Engineering discipline. It prevents the AI from "vibe-coding"—guessing, spraying CSS hacks, pushing untested code, and stacking bad fixes. Born from a real incident where one AI produced 10+ broken commits via trial-and-error while the correct solution required exactly 1 clean commit with proper root cause analysis.

---

## 1. Investigate-First (Zero Assumptions)

- **NEVER** assume the state of the codebase from conversation history, summaries, or memory alone.
- Before proposing or writing ANY modification, you MUST run `view_file`, `cat`, or `git log` to read the **actual, current** state of the code.
- Before proposing a CSS/layout fix, you MUST understand the full rendering pipeline: What is the parent container's background? What is the element's overflow behavior? What does the image actually look like (dimensions, transparency)?
- If there's a discrepancy between what you expect and what you see, INVESTIGATE the discrepancy first. Do not paper over it.

## 2. Hypothesis-Driven Engineering (No Spray-and-Pray)

- **Trial-and-error coding is strictly PROHIBITED.**
- Before applying ANY fix, you MUST explicitly state:
  1. **Root Cause:** "The problem is [X] because [evidence]."
  2. **Proposed Fix:** "I will change [Y] to [Z]."
  3. **Why It Works:** "This fixes the root cause because [logical explanation]."
- If you CANNOT articulate all three, you are NOT ready to write code. Go back to investigating.
- CSS-specific: Do not blindly apply `dark:invert`, `scale-[1.10]`, `drop-shadow`, `filter`, or any visual hack without calculating the exact mathematical effect it will have.

## 3. Execution Gates (Stop & Verify Before Push)

- **NEVER** fire-and-forget commits directly to production (e.g., Vercel, Netlify) without local verification.
- After writing code and saving it locally, **STOP**.
- Tell the user: *"I applied the fix locally. Please check your localhost and confirm before I push."*
- ONLY run `git commit` and `git push` after the user explicitly confirms the fix is working.
- Exception: The user explicitly says "push na" or "go ahead and push".

## 4. Strict Rollback Discipline (No Band-Aid Stacking)

- If your applied fix fails or worsens the issue, you are **FORBIDDEN** from writing a new fix on top of the broken code.
- You MUST **IMMEDIATELY** run `git checkout -- <file>`, `git restore <file>`, or `git reset --hard HEAD~1` to revert to the last known good state.
- Only AFTER reverting to clean state may you attempt Plan B.
- Keep the git history clean: **One problem = One clean commit, not 10 "fix:" commits.**

## 5. Production Parity Awareness

- **Localhost ≠ Production.** Always consider that:
  - Next.js Image Optimizer behaves differently on Vercel vs local dev
  - Environment variables may differ
  - CDN caching may serve stale assets
  - Image optimization/compression may alter transparency, colors, or dimensions
- When debugging a "works on localhost but broken on Vercel" issue, the FIRST thing to check is the build pipeline and asset processing, not the CSS.

## 6. Multi-Session Awareness

- When the user mentions "the other AI" or "the other chat" made changes, do NOT blindly trust those changes.
- Always verify what the other session actually changed by reading `git log` and the actual files.
- If the user says to NOT touch something that another session worked on, **OBEY ABSOLUTELY**. Do not "improve" or "clean up" their work unless explicitly asked.
