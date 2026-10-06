---
name: gsap-react-strict
description: Critical safety rules for using GSAP in React 18+ (App Router). Enforces useGSAP to prevent severe memory leaks and strict-mode double firing.
trigger: model_decision
---

# Rule: GSAP in React (Memory Leak Prevention)

> **Purpose:** Prevents frame-drops, duplicate animations, and memory leaks caused by incorrect GSAP implementation in modern React environments.

## 1. The `@gsap/react` Mandate
You are **STRICTLY FORBIDDEN** from using raw `useEffect` or `useLayoutEffect` to trigger GSAP animations in React components. React 18's Strict Mode mounts, unmounts, and remounts components, which causes raw GSAP tweens to double-fire and leak memory.

**You MUST use the `useGSAP()` hook from the `@gsap/react` package.**

### Incorrect (Never do this):
```tsx
// ❌ WRONG: Causes memory leaks and double-firing
useEffect(() => {
  gsap.to('.box', { x: 100 });
}, []);
```

### Correct (Required):
```tsx
// ✅ RIGHT: Automatically handles cleanup and context
import { useGSAP } from '@gsap/react';

useGSAP(() => {
  gsap.to('.box', { x: 100 });
});
```

## 2. Scoping Selectors
When targeting elements, you must use the `scope` property inside `useGSAP` instead of global class names to avoid accidentally animating elements in other components.

```tsx
const container = useRef();

useGSAP(() => {
  // This will ONLY target the '.box' inside the container ref
  gsap.to('.box', { rotation: 360 });
}, { scope: container });
```

## 3. Responsive & State-driven Animations
If your GSAP animation depends on React state (e.g., triggering an animation when `isOpen` changes), pass the state variable into the `dependencies` array of `useGSAP`, just like a standard React hook.
