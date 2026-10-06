---
name: anti-slop-design-engines
description: "Strict anti-slop design constraints and high-end aesthetic engines (Apple Spring, Ethereal Glass, Industrial Brutalism) for UI/UX generation."
trigger: model_decision
---

# Dev-Library Rule Extensions: Anti-Slop Design & Aesthetic Engines

## 1. Global Anti-Slop Safeguards
- **Zero Em-Dashes:** Ban the use of em-dashes (—) in UI copy, headlines, or eyebrows.
- **Banned "AI Tells":** No generic purple/blue gradients, no decorative "eyebrow" tags above every section, and no overused `Inter`, `Roboto`, or `Arial` fonts.
- **Headline Typography:** Ensure wide hero containers (`max-w-5xl+`) so H1s flow horizontally (max 2-3 lines height), avoiding the narrow, hyper-wrapped AI default.
- **Section Pacing (AIDA):** Enforce massive breathing room between vertical sections using `py-32 md:py-48`.

## 2. Ethereal Glass & Agency Tier ($150k+ Aesthetic)
- **Texture Profiles:** Choose ONE: 
  - *Ethereal Glass:* OLED Black (`#050505`), hair-line borders (`border-white/10`), subtle mesh gradients.
  - *Editorial Luxury:* Warm cream canvas (`#FDFBF7`), noise grain.
  - *Soft Structuralism:* Silver-grey backgrounds with diffused ambient shadows.
- **Micro-Interactions:** Ban linear or `ease-in-out` transitions. Use spring physics for state changes:
  - `transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
- **Hover States:** Use ultra-diffuse shadows and hairline highlights:
  - `hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]`
- **Mobile Fallback:** Enforce `min-h-[100dvh]` for layout wrappers to prevent viewport jumpiness.

## 3. Apple Human Interface & Physical Motion
- **Instant Response:** UI must respond on pointer-down (0 delays).
- **Drag Mechanics:** Drag interactions must have 1:1 pointer tracking. Zero CSS `@keyframes` on drag.
- **Interruptible Springs:** Hand off release velocity on touch-up (`gestureVelocity / (target - current)`).
- **Spring Defaults:** Use critical damping for fluid transitions (`damping: 1.0`, `response: 0.3-0.4`).
- **Standard Motion Curve:** `duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]`

## 4. High-Craft GPU Performance Rules
- **No `scale(0)`:** UI objects do not pop out of thin air. Animate from `scale(0.95)` with `opacity: 0`.
- **Ban `transition: all`:** Explicitly declare GPU-accelerated properties (`transform, opacity`).
- **Ban `ease-in`:** Never use `ease-in` on UI entrances; it feels sluggish.
- **Spatial Origins:** Bind popovers to their trigger point using dynamic `transform-origin: var(--transform-origin)`.
- **The Frequency Rule:** High-frequency interactions (100+/day, e.g., command palettes, keyboard shortcuts) MUST have zero animation.

## 5. Industrial Brutalism & Telemetry HUDs
- **Mechanical Geometry:** Hard ban on rounded corners. Enforce `rounded-none`.
- **Visible Architecture:** Use rigid 1px visible grid lines (`border border-neutral-800`) and crosshairs (`+`) at intersections.
- **Macro/Micro Typography Contrast:** 
  - *Macro:* Display headers in Neue Haas Grotesk / Monument Extended, uppercase, tight leading (`0.85`), tracking (`-0.04em`).
  - *Micro:* Telemetry metadata in monospace (JetBrains Mono) fixed at `11px`, uppercase.

## 6. Utilitarian Minimalism (Notion/Linear Style)
- **Palette:** Off-white/warm bone canvas (`#F7F6F3` or `#FFFFFF`) with surface cards set to pure white.
- **Accents:** Use muted pastels for badges/tags (Pale Red `#FDEBEC`, Pale Blue `#E1F3FE`, Pale Green `#EDF3EC`). 
- **Flat Depth:** No heavy drop shadows (`shadow-md`, `shadow-xl`). Use light structural borders instead (`border-black/5` or `rgba(0,0,0,0.06)`).
- **Typography Pairings:** Pair editorial serifs (Newsreader, Playfair) with clean geometric sans (Geist, SF Pro).

## 7. GSAP Motion Integration
- **Context Binding:** Always bind ScrollTriggers inside a `useLayoutEffect` / `useEffect` and explicitly clean up (`ctx.revert()`).
- **No Native Scroll Listeners:** Ban direct `window.onscroll` binding for layout animations.
