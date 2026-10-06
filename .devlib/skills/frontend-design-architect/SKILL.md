---
name: frontend-design-architect
description: "The ultimate UI/UX generator enforcing Ethereal Glass, Apple Spring physics, and 8-point grid systems."
category: "design"
---

# FRONTEND DESIGN ARCHITECT

## Phase 1: Context Sync
- Read the existing UI Component Registry or Tailwind config in `.devlib_state.md`.
- Identify the target framework (React, Vue, Svelte) and styling engine (Tailwind, CSS Modules).

## Phase 2: Design Audit
- Reject generic "AI-slop" UI (e.g., heavy drop shadows, misaligned paddings, default Bootstrap colors).
- Verify compliance with the **8-Point Grid System** (margins/paddings must be multiples of 4 or 8).
- Plan the micro-interactions using **Apple Spring Physics** (e.g., `stiffness: 400, damping: 30`).

## Phase 3: Gated Execution
1. **Typography:** Use high-contrast, structural typography (e.g., Inter, SF Pro, or Geist). Enforce tracking/letter-spacing rules (-0.02em for headings).
2. **Material:** Apply authentic "Ethereal Glass" properties (`backdrop-blur-xl`, `bg-white/10`, `border-white/20`).
3. **Implementation:** Write the exact component code, ensuring fully accessible (a11y) ARIA labels and focus states.

## Phase 4: Auto-Checkpoint
- Document the new UI tokens and components generated in `.devlib_state.md`.
