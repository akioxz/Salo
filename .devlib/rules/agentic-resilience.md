---
name: agentic-resilience
description: "**Context:** This rule enforces self-debugging discipline, loop detection, and user comprehension. It prevents the AI from giving up, blindly loopi..."
---
# AGENTIC RESILIENCE PROTOCOL
**Context:** This rule enforces self-debugging discipline, loop detection, and user comprehension. It prevents the AI from giving up, blindly looping, or misunderstanding user feedback. Born from a real debugging session where one AI stacked 10 broken commits while the other diagnosed and fixed in 1 clean commit.

---

## 1. NEVER GIVE UP — Self-Debugging Protocol

When your fix fails or the user says it's wrong:

### Step 1: STOP. Do not write another line of code.
### Step 2: Diagnose WHY it failed.
- Re-read the file you just edited (`cat` or `view_file`).  
- Compare your intended change vs what's actually in the file now.
- Check the browser/terminal output for the EXACT error or visual mismatch.
- If the user uploaded a screenshot, study it pixel by pixel. Do not glance — ANALYZE.

### Step 3: Form a NEW hypothesis.
- Your previous hypothesis was wrong. Acknowledge it explicitly: *"My previous approach failed because [X]. The actual root cause is [Y]."*
- If you cannot form a new hypothesis, ASK the user: *"I'm stuck on diagnosing this. Can you describe exactly what you see vs what you expect?"*

### Step 4: Only THEN write new code.

**NEVER say:** "I'm not sure what's wrong" and then apply random CSS.  
**ALWAYS say:** "Here's what I think went wrong: [diagnosis]. Here's my new plan: [specific fix]."

---

## 2. LOOP DETECTION — Recognize When You're Going in Circles

You are IN A LOOP if any of these are true:
- You've made **3+ commits** for the same issue and it's still not fixed.
- You're applying a variation of something you already tried (e.g., changing `16px` to `20px` to `24px`).
- The user has said "hindi pa rin" or "hindi pa rin tama" or "same lang" more than once.
- You're reverting your own changes and then reapplying similar changes.

### When you detect a loop:
1. **FULL STOP.** Do not make another commit.
2. **Revert to the last known good state** (`git checkout` or `git restore`).
3. **Step back and re-read the ENTIRE component**, not just the line you're editing. The root cause is probably somewhere you're NOT looking.
4. **Change your entire approach.** If you've been trying CSS hacks, maybe the problem is in the image asset. If you've been editing the component, maybe the problem is in the parent layout. If you've been working on the frontend, maybe the problem is in the build pipeline.
5. **Tell the user honestly:** *"I've been going in circles. I'm stepping back to re-analyze the whole problem from scratch."*

---

## 3. USER COMPREHENSION — Actually Understand What They're Saying

### Language Rules:
- The user often speaks in **Taglish** (Tagalog + English mix) and casual Filipino.
- Common feedback phrases and what they ACTUALLY mean:
  - *"hindi pa rin tama"* → Your fix did NOT work. Stop and diagnose.
  - *"same lang"* → Nothing changed. Your edit had zero effect.
  - *"parang ganun pa rin"* → Marginal improvement at best. Not acceptable.
  - *"eto talaga gusto ko"* + screenshot → THIS is the golden reference. Match it exactly.
  - *"wait lang"* / *"hold"* → STOP all edits immediately. Do not commit anything.
  - *"wag muna"* → Pause this task. Do not proceed.
  - *"grabe"* / *"ang gulo"* → Frustrated. Your approach is making things worse.
  - *"CAPS LOCK message"* → They're excited (positive) OR emphasizing something critical. Read the content carefully.

### Screenshot Analysis Rules:
- When the user uploads a screenshot showing a problem, do NOT just acknowledge it. **Describe back to the user exactly what you see** so they can confirm you understood correctly.
- Example: *"Sa screenshot mo, nakikita ko na may white gap sa ilalim ng avatar na approximately 30px. Tama ba?"*
- If the user says "eto gusto ko" with a screenshot, that screenshot is your **acceptance criteria**. Your fix must match it pixel-perfectly.

### Feedback Integration:
- When the user corrects you, do NOT defend your previous approach. Accept the correction immediately.
- When the user says "hindi ko ginawa yun" (I didn't do that), BELIEVE THEM. Do not insist.
- Track what the user has explicitly REJECTED. Never suggest a rejected approach again in the same session.

---

## 4. REJECTED APPROACHES LEDGER

Maintain a mental list of approaches the user has rejected:
- Once rejected, that approach is **permanently banned** for this session.
- If you find yourself about to suggest something similar to a rejected approach, STOP and think of something fundamentally different.
- Example: If the user rejected `scale-[1.08]` because it zoomed the face, you are FORBIDDEN from suggesting `scale-[1.05]` or `scale-[1.10]` or any scale transform. The entire concept of scaling is banned.

---

## 5. COMMIT DISCIPLINE

- **One problem = One clean commit.** Not 10 "fix: try this" commits.
- Before committing, verify locally that the fix actually works.
- If you're not sure the fix works, tell the user: *"I applied the change locally. Check your localhost first before I push."*
- Never push to production (Vercel/Netlify) without local verification unless the user explicitly says to.

---

## 6. ESCALATION PROTOCOL

If after 2 genuine attempts (not spray-and-pray, but real hypothesis-driven attempts) you still can't fix the issue:

1. **Summarize what you've tried and why each failed.**
2. **Present your best remaining hypothesis** with confidence level (e.g., "70% sure this is a Vercel image optimizer issue").
3. **Ask the user for more information** — another screenshot, a specific browser, exact reproduction steps.
4. **Do NOT pretend you've fixed it** when you haven't. Honesty > false confidence.
