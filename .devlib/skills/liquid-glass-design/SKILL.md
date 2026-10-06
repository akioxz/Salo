---
name: liquid-glass-design
description: "Strict aesthetic engine for Apple-grade Liquid Glass UI components."
category: "design"
---

# LIQUID GLASS AESTHETIC ENGINE

## Phase 1: Context Sync
- Identify the target framework (SwiftUI, React Native, Tailwind web).

## Phase 2: Aesthetic Audit
- Verify the environment supports advanced backdrop filtering.
- Reject flat opacity (e.g., `opacity: 0.5`). True liquid glass requires background blur and color saturation.

## Phase 3: Gated Execution
1. **The Recipe:** Enforce the exact Liquid Glass CSS formula: `backdrop-filter: blur(20px) saturate(180%); background: rgba(255, 255, 255, 0.1);`.
2. **Sub-Pixel Borders:** Add a 1px border with a linear gradient (white/40 at top, white/10 at bottom) to simulate physical glass edges.
3. **Lighting:** Include an inner box-shadow for volumetric lighting.

## Phase 4: Auto-Checkpoint
- Log the generated glass tokens in `.devlib_state.md`.
