# 🧠 Today I Learned (TIL)

A collection of concise write-ups on discoveries, gotchas, and debugging breakthroughs.

---

## Next.js

### Strict Linting: `react-hooks/static-components`
**Date:** 2026-09-20  
**Context:** If you dynamically assign a capitalized variable to a functional component reference inside a render block (e.g., `const CategoryIcon = getCategoryIcon(...)`) and then render it using JSX `<CategoryIcon />`, Next.js ESLint will throw a `react-hooks/static-components` error, assuming you are redefining a component on every render which destroys state.
**Fix:** Execute the function assignment inside an IIFE (Immediately Invoked Function Expression) within the JSX curly braces, or assign it outside the component body.
